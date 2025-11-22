import { GoogleGenAI } from "@google/genai";

export const generatePropertyDescription = async (
  features: string[],
  location: string,
  type: 'sale' | 'rent_seasonal',
  bedrooms: number
): Promise<string> => {
  try {
    // Initialize AI only when needed, preventing crashes on app load if env var is missing
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Atue como um corretor de imóveis experiente especializado em imóveis de luxo no litoral.
      Escreva uma descrição atraente e vendedora (máximo 120 palavras) para um imóvel com as seguintes características:
      - Tipo: ${type === 'sale' ? 'Venda' : 'Aluguel de Temporada'}
      - Localização: ${location}
      - Quartos: ${bedrooms}
      - Características: ${features.join(', ')}

      A descrição deve despertar o desejo de morar ou passar férias na praia. Use emojis moderadamente.
      Não use formatação markdown como negrito, apenas texto corrido.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Descrição não disponível no momento.";
  } catch (error) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return "Não foi possível gerar a descrição automática. Verifique se a Chave de API está configurada corretamente.";
  }
};