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

        // 1. Gather Context
        // Fetch top 5 restaurants for recommendation context
        const restaurants = await Restaurant.find({
            isActive: true,
            status: 'approved'
        })
            .select('restaurantName cuisine averageRating address.city')
            .sort({ averageRating: -1 })
            .limit(5);

        // If user is logged in, maybe fetch their last order status?
        let orderContext = "";
        if (userId) {
            const lastOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
            if (lastOrder) {
                orderContext = `User's last order was from ${lastOrder.restaurantName} (Status: ${lastOrder.status}).`;
            }
        }

        // 2. Construct System Prompt
        const restaurantList = restaurants.map(r =>
            `- ${r.restaurantName} (${r.cuisine.join(', ')}), Rating: ${r.averageRating}, City: ${r.address?.city}`
        ).join('\n');

        const systemPrompt = `
        You are QuickBites AI, a helpful food delivery assistant. 
        Your goal is to help users find food, check orders, and navigate the site.
        
        Here is some context about our top restaurants:
        ${restaurantList}

        ${orderContext}

        Rules:
        1. Only answer questions about food, restaurants, orders, and this website features.
        2. If asked about "best restaurant", recommend from the list above based on rating.
        3. Keep answers concise and friendly.
        4. If the user asks to navigate (e.g., "Go to settings", "View orders"), reply with a special action tag like [NAVIGATE:/settings] or [NAVIGATE:/orders] at the end of your sentence.
        5. If asked about something unrelated (e.g. politics, coding), politely refuse.
        `
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
