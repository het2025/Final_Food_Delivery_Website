// import { GoogleGenerativeAI } from "@google/generative-ai"; // Replaced by Groq
import Groq from "groq-sdk";
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

        // If user is logged in, fetch last order
        let orderContext = "";
        if (userId) {
            const lastOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
            if (lastOrder) {
                orderContext = `User's last order was from ${lastOrder.restaurantName} (Status: ${lastOrder.status}).`;
            }
        }

        // 2. Construct System Prompt
        const systemPrompt = `
        You are QuickBites AI, a smart food delivery assistant. 
        
        DATA CONTEXT (All available restaurants):
        ${contextList}
        
        USER CONTEXT:
        ${orderContext}

        YOUR GOAL:
        Help users find specific dishes or restaurants by navigating them to the search page.

        RULES & BEHAVIOR:
        1. **Dish Search**: If user asks for a dish (e.g., "I want pizza", "Any burgers?"), recommend a restaurant but then...
           - **CRITICAL**: Add a navigation button using this EXACT format: [NAVIGATE:/restaurants?search=KEYWORD].
           - Use the main keyword the user asked for (e.g., "pizza", "burger", "biryani").
           - Example: "Pizza Hut has great options! [NAVIGATE:/restaurants?search=pizza]".
        
        2. **Restaurant Search**: If user asks for a specific restaurant (e.g., "Take me to Azure"):
           - Example: "Sure, let's go to Azure. [NAVIGATE:/restaurants?search=azure]".
        
        3. **General Navigation**: 
           - "Go to orders" -> [NAVIGATE:/orders]
           - "Go to cart" -> [NAVIGATE:/cart]
           - "Show profile" -> [NAVIGATE:/profile]
        
        4. **Tone**: Enthusiastic, short, and helpful. Don't dump too much text.
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
