const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    // Hack to access the underlying API for listing models since SDK might hide it or require specific usage
    // The Node SDK exposes it via the `getGenerativeModel` but listing is separate.
    // Actually, we can just use fetch since we know the key.

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API key found!");
        return;
    }

    console.log("Listing models via fetch...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

listModels();
