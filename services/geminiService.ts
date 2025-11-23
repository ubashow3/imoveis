
import { GoogleGenAI } from "@google/genai";

// Função segura para pegar a chave (evita crash se process não existir)
const getApiKey = () => {
  // No Vercel ou ambiente node
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // Fallback vazio (o Gemini vai dar erro de auth, mas o site não trava)
  return "";
};

export const generatePropertyDescription = async (
  features: string[],
  location: string,
  type: 'sale' | 'rent_seasonal',
  bedrooms: number
): Promise<string> => {
  try {
    const key = getApiKey();
    if (!key) {
      console.warn("Gemini: API Key não encontrada.");
      return "Descrição automática indisponível (Chave de API faltando).";
    }

    const ai = new GoogleGenAI({ apiKey: key });

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
    return "Não foi possível gerar a descrição automática. (Erro de Conexão IA)";
  }
};
