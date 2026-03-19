import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are the Senior Veterinary Biosecurity Expert for the Digital Farm Biosecurity Management Portal. 
        Your goal is to provide world-class, actionable, and scientifically-backed recommendations for pig and poultry farmers.
        
        Key Guidelines:
        1. Prioritize disease prevention (ASf, Bird Flu, etc.).
        2. Provide specific sanitation protocols (dilution ratios, contact times if applicable).
        3. Use a professional, authoritative, yet supportive tone.
        4. Structure your responses with clear headings, bullet points, and bold text for emphasis.
        5. If a situation sounds like a critical disease outbreak, strongly advise immediate veterinary contact.
        6. Keep biosecurity compliance at the forefront of every answer.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};
