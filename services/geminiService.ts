import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Ideally, in a production app, we might want to let the user input their key if env is missing, 
// but per instructions we use process.env.API_KEY directly.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeCode = async (code: string, prompt: string): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const fullPrompt = `
      You are an expert senior software engineer and code reviewer.
      
      Context - User's Code:
      \`\`\`
      ${code}
      \`\`\`

      User Request: ${prompt}

      Provide a concise, helpful response. If you provide code, wrap it in markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while communicating with the AI.";
  }
};