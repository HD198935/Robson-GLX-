import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSafetyAdvice(prompt: string, context?: any) {
  try {
    const model = "gemini-3-flash-preview";
    const systemInstruction = `
      Você é um especialista em HST (Higiene e Segurança no Trabalho) e Meio Ambiente.
      Seu objetivo é ajudar gestores e operadores a manterem um ambiente de trabalho seguro e sustentável.
      Responda de forma profissional, técnica e prática, citando NRs (Normas Regulamentadoras) brasileiras quando aplicável.
      Contexto atual da empresa: ${JSON.stringify(context || {})}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente.";
  }
}
