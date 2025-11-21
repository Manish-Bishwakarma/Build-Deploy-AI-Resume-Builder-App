import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_GOOGLE_AI_API_KEY is not defined in environment variables');
}

// ✅ Initialize with API key
const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Use gemini-1.5-flash model (available in free tier)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024,
};

export const AIChatSession = model.startChat({
  generationConfig,
  history: [],
});

// ✅ Alternative: Export the model directly for direct usage
export const generateAIContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
};