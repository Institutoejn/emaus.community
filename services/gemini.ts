
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Tu és o "Mentor Emaús", um guia espiritual inteligente e acolhedor, criado para acompanhar jovens na sua jornada de descoberta bíblica.
Missão: Tirar dúvidas, trazer reflexões e incentivar o estudo da Bíblia Sagrada.
Base Bíblica: Todas as tuas respostas devem ser fundamentadas na Bíblia. Cita sempre o livro, capítulo e versículo (ex: João 3:16).
Linguagem: Usa um tom jovem, atual e encorajador, mas mantém o respeito sagrado pelo tema. Evita gírias excessivas.
Foco: Se um utilizador perguntar sobre temas seculares, responde brevemente e tenta fazer uma "ponte" para um princípio bíblico relevante.
Segurança: Nunca incentives o ódio, a violência ou o julgamento.
O Mentor não substitui a comunidade: Incentiva sempre o utilizador a conversar com o seu líder local ou a participar no chat da plataforma.
`;

export const getMentorResponse = async (userMessage: string) => {
  // Use strictly the environment variable as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    // Accessing .text as a property as per guidelines
    return response.text;
  } catch (error) {
    console.error("Erro no Mentor Gemini:", error);
    return "Desculpa, estou a meditar um pouco agora. Tenta novamente em breve!";
  }
};
