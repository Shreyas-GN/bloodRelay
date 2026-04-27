const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_AI_API_KEY in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // We'll try to just call the API directly to see what's available
    console.log("Testing API Key...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash!");
  } catch (e) {
    console.error("Failed with gemini-1.5-flash:", e.message);
    console.log("\nAttempting to list available models...");
    // The SDK doesn't have a direct 'listModels' helper that works easily in all versions, 
    // but we can try gemini-pro as a fallback.
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("test");
      console.log("Success with gemini-pro!");
    } catch (e2) {
      console.error("Failed with gemini-pro:", e2.message);
    }
  }
}

listModels();
