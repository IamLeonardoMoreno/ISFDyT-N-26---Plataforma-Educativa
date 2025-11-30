import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: Ensure API_KEY is set in your environment variables (e.g. Vercel Project Settings)
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const generateTutorResponse = async (question: string, subject: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful and encouraging virtual tutor for the subject: "${subject}". 
      A student asks: "${question}". 
      Provide a clear, concise, and educational answer. Use formatting (bolding, lists) to make it readable.
      If the question is not related to studying, politely redirect them to academic topics.`,
    });
    
    return response.text || "Lo siento, no pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocurrió un error al contactar al tutor virtual. Por favor intenta más tarde.";
  }
};

export const generateLessonPlan = async (topic: string, gradeLevel: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a structured lesson plan for:
      Topic: ${topic}
      Level: ${gradeLevel}
      
      Format the response using Markdown. Include:
      1. Learning Objectives
      2. Introduction/Warm-up (time estimate)
      3. Main Activity (time estimate)
      4. Assessment/Closure (time estimate)
      5. Required Resources`,
    });

    return response.text || "No se pudo generar la planificación.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al generar la planificación. Verifica tu conexión o intenta nuevamente.";
  }
};

export const analyzeInstitutionalData = async (dataDescription: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as an educational data analyst for a Director of an Institute.
      Analyze the following institutional data summary:
      "${dataDescription}"
      
      Provide an executive report in Markdown format with:
      1. Situation Analysis (Identify key trends, both positive and negative)
      2. Pattern Identification (Correlations or underlying causes)
      3. Strategic Recommendations (3 concrete, actionable steps to improve the situation)
      
      Keep the tone professional and strategic.`,
    });

    return response.text || "No se pudo realizar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al realizar el análisis de datos.";
  }
};
