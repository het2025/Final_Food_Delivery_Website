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

        // 1. Gather Context - FULL SEARCH
        // Fetch all active restaurants with their popular items/menu highlights
        const restaurants = await Restaurant.find({
            isActive: true,
            status: 'approved'
        })
            .select('name cuisine averageRating address.city menu restaurantId')
            .lean();

        // Format context for AI
        const contextList = restaurants.map(r => {
            // Get top 5 popular or main items from menu
            let highlights = [];
            if (r.menu && r.menu.length > 0) {
                r.menu.forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            if (item.isPopular || highlights.length < 5) {
                                highlights.push(item.name);
                            }
                        });
                    }
                });
            }
            const uniqueHighlights = [...new Set(highlights)].slice(0, 8).join(', ');

            // Critical: Use _id for the link if that's what the frontend expects
            return `ID: ${r._id} | Name: ${r.name} | Cuisine: ${r.cuisine?.join(', ')} | Rating: ${r.averageRating}⭐ | Best For: ${uniqueHighlights}`;
        }).join('\n');

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
                const statusRegex = /pending|confirmed|accepted|preparing|ready|out_for_delivery|out for delivery/i;

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

        6. **Tone**: Enthusiastic, short, and helpful. Don't dump too much text.
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
