// import { GoogleGenerativeAI } from "@google/generative-ai"; // Replaced by Groq
import Groq from "groq-sdk";
import mongoose from 'mongoose'; // Added mongoose
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';

// Initialize Groq
// Note: API Key will be loaded from process.env.GROQ_API_KEY
const getGroq = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const chatWithAI = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // Fetch all active restaurants with their popular items/menu highlights
        let restaurants = await Restaurant.find({
            isActive: true,
            status: 'active'
        })
            .select('name cuisine averageRating address.city menu restaurantId priceRange')
            .lean();

        // OPTIMIZATION: Limit to top 30 rated restaurants to prevent Rate Limit (413)
        // Sort by rating first to get the "best" ones
        restaurants.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        let limitedRestaurants = restaurants.slice(0, 30);

        // EXTRA FILTER: Remove "Azure" if present, as per user request
        limitedRestaurants = limitedRestaurants.filter(r => !r.name.toLowerCase().includes('azure'));

        // SHUFFLE the list to ensure "Surprise Me" doesn't always pick the same one
        for (let i = limitedRestaurants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [limitedRestaurants[i], limitedRestaurants[j]] = [limitedRestaurants[j], limitedRestaurants[i]];
        }

        // Format context for AI
        const contextList = limitedRestaurants.map(r => {
            let vegCount = 0;
            let totalItems = 0;
            let userHighlights = [];
            let minPrice = Infinity;
            let maxPrice = 0;


            if (r.menu && r.menu.length > 0) {
                r.menu.forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            totalItems++;
                            if (item.isVeg) vegCount++;

                            // Track Prices
                            if (item.price) {
                                if (item.price < minPrice) minPrice = item.price;
                                if (item.price > maxPrice) maxPrice = item.price;
                            }
                            // Track Highlights
                            if (item.isPopular || userHighlights.length < 5) {
                                userHighlights.push(item.name);
                            }
                        });
                    }
                });
            }

            // Fallback if no prices found
            if (minPrice === Infinity) minPrice = "N/A";
            if (maxPrice === 0) maxPrice = "N/A";

            const priceString = (minPrice !== "N/A") ? `₹${minPrice}-₹${maxPrice}` : r.priceRange || 'N/A';
            const uniqueHighlights = [...new Set(userHighlights)].slice(0, 4).join(', ');

            // Dietary Info
            const isPureVeg = totalItems > 0 && vegCount === totalItems;
            const dietaryLabel = isPureVeg ? "Pure Veg" : (vegCount > 0 ? "Mixed / Veg Options" : "Non-Veg Only");

            // EXPLICIT FORMAT for the AI to read
            // Handle Missing Rating
            const ratingDisplay = r.averageRating ? `${r.averageRating}⭐` : "New (No Rating)";

            // EXPLICIT FORMAT for the AI to read
            return `ID: ${r._id} | Name: ${r.name} | Avg Cost: ${priceString} | Cuisine: ${r.cuisine?.join(', ')} | Dietary: ${dietaryLabel} | Rating: ${ratingDisplay} | Top Items: ${uniqueHighlights}`;
        }).join('\n');

        console.log("------------------- AI CONTEXT BEGIN -------------------");
        console.log(contextList);
        console.log("------------------- AI CONTEXT END -------------------");

        // If user is logged in, fetch ACTIVE orders (not just last one)
        let orderContext = "";
        let activeOrdersList = "";

        // Debug Logs to console
        // Debug Logs to console
        console.log("AI Context - UserId (Raw):", userId);

        if (userId) {
            let userObjectId;
            try {
                userObjectId = new mongoose.Types.ObjectId(userId);
            } catch (e) {
                console.error("Invalid User ID format:", userId);
            }

            if (userObjectId) {
                // Find orders that are NOT delivered or cancelled
                const statusRegex = /pending|confirmed|accepted|preparing|ready|out_for_delivery|out for delivery|outfordelivery|picked up/i;

                const activeOrders = await Order.find({
                    customer: userObjectId, // Fixed: Schema uses 'customer' and explicit ObjectId
                    status: { $regex: statusRegex }
                }).sort({ createdAt: -1 });

                console.log("AI Context - Active Orders Found:", activeOrders.length);
                if (activeOrders.length > 0) {
                    console.log("AI Context - First Order Status:", activeOrders[0].status);
                }

                if (activeOrders.length > 0) {
                    // We have live orders!
                    activeOrdersList = activeOrders.map(o =>
                        `Order ID: ${o._id} | Restaurant: ${o.restaurantName} | Status: ${o.status} | Items: ${o.items.length} items`
                    ).join('\n');
                    orderContext = `USER HAS ACTIVE ORDERS:\n${activeOrdersList}`;
                } else {
                    orderContext = "USER HAS NO ACTIVE ORDERS.";
                }

                // FETCH HISTORY (For Reorder Feature)
                // Find the most recent DELIVERED order
                const lastCompletedOrder = await Order.findOne({
                    customer: userObjectId,
                    status: 'Delivered'
                }).sort({ createdAt: -1 });

                if (lastCompletedOrder) {
                    orderContext += `\n\nUSER HISTORY:\nLast completed meal was from ${lastCompletedOrder.restaurantName}. Items: ${lastCompletedOrder.items.map(i => i.name).join(', ')}.`;
                }
            }
        } // Close if(userId)

        // 2. Construct System Prompt
        const systemPrompt = `
        You are QuickBites AI, a smart food delivery assistant. 
        
        DATA CONTEXT (All available restaurants):
        ${contextList}
        
        USER CONTEXT:
        ${orderContext}

        YOUR GOAL:
        Help users find food, TRACK ORDERS, and navigate the site.

        RULES & BEHAVIOR:
        1. **Live Order Tracking**: 
           - **CHECK USER CONTEXT FIRST**: 
           - IF "USER HAS ACTIVE ORDERS":
             - Reply: "Your order from [Restaurant Name] is currently **[Status]**."
             - **MANDATORY**: Add this button: [NAVIGATE:/track-order/ACTUAL_ORDER_ID].
             - **IMPORTANT**: Replace "ACTUAL_ORDER_ID" with the specific alphanumeric ID (e.g., 64f5...) from the context.
             - **CRITICAL**: Do NOT use a fake or example ID. Use the REAL ID from the User Context.
           - IF "USER HAS NO ACTIVE ORDERS":
             - Reply: "You don't have any active orders right now." 
             - DO NOT generate a "track-order" link for past orders.

        2. **Dish Search**: If user asks for a dish (e.g., "I want pizza", "Any burgers?"), recommend a restaurant but then...
           - **CRITICAL**: Add a navigation button using this EXACT format: [NAVIGATE:/restaurants?search=KEYWORD].
           - Use the main keyword the user asked for (e.g., "pizza", "burger", "biryani").
           - Example: "Pizza Hut has great options! [NAVIGATE:/restaurants?search=pizza]".
        
        3. **Restaurant Search**: If user asks for a specific restaurant (e.g., "Take me to Azure"):
           - Example: "Sure, let's go to Azure. [NAVIGATE:/restaurants?search=azure]".
        
        4. **General Navigation**: 
           - "Go to orders" -> [NAVIGATE:/orders]
           - "Go to cart" -> [NAVIGATE:/cart]
           - "Show profile" -> [NAVIGATE:/profile]
        
        5. **Reorder Last Meal**:
           - If user asks "Reorder my last meal" or "What did I eat last?":
           - Look at "USER HISTORY" in context.
           - Reply: "Your last meal was [Items] from [Restaurant]. Want to order it again? [NAVIGATE:/restaurants?search=RESTAURANT_NAME]"
           - Example: "Your last meal was Butter Chicken from Punjab Grill. [NAVIGATE:/restaurants?search=Punjab Grill]"

        6. **Surprise Me / Random Pick**:
           - If user asks "Surprise me", "Pick for me", or "What should I eat?":
           - **ACTION**: The "DATA CONTEXT" list is ALREADY sorted and shuffled for you.
           - **Logic**: Simply pick the **FIRST** or **SECOND** restaurant from the top of the list.
           - Reply: "How about **[Name]**? They serve delicious [Cuisine] and have a [Rating] star rating! 🎲"
           - **MANDATORY**: Add the link: [NAVIGATE:/restaurants?search=Exact_Name]
            - Example: "How about **Azure**? They have great Italian food! [NAVIGATE:/restaurants?search=Azure]"

         8. **Dietary Helper (Veg/Non-Veg)**:
            - If user asks "Is this veg?" or "Show me veg options":
            - Check the "Dietary" field in the context.
            - If user wants STRICT veg, suggest "Pure Veg" restaurants.
            - Action: Suggest searching for "pure veg" -> [NAVIGATE:/restaurants?search=Pure Veg]
            - Example: "Pizza Hut has many veg options. [NAVIGATE:/restaurants?search=Pizza Hut]"
            - Example: "For strict vegetarian food, check out these places. [NAVIGATE:/restaurants?search=Pure Veg]"

        9. **Tone & Privacy**: 
           - **CRITICAL**: NEVER output the "DATA CONTEXT" or "Let's check..." thoughts to the user. 
           - Just give the answer directly.
           - Keep it short and helpful.
        `;

        // 3. Call Groq
        try {
            const groq = getGroq();

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                // Using the latest supported model
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
            });

            const reply = completion.choices[0]?.message?.content || "I didn't get any response. Please try again.";

            res.json({ success: true, reply });

        } catch (apiError) {
            console.error("Groq API Error:", apiError);
            if (apiError.message?.includes("API key")) {
                return res.status(500).json({ success: false, message: "Server configuration error: Invalid Groq API Key." });
            }
            res.status(500).json({ success: false, message: "AI is currently unavailable. Please try again later." });
        }

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
