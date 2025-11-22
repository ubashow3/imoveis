import { GoogleGenAI } from "@google/genai";

// Helper seguro para pegar variáveis de ambiente sem quebrar o site
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignora erro se process não existir
  }
  return ''; // Retorna vazio se não encontrar
};

export const generatePropertyDescription = async (
  features: string[],
  location: string,
  type: 'sale' | 'rent_seasonal',
  bedrooms: number
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    
    // Se não tiver chave, retorna erro amigável sem travar o app
    if (!apiKey) {
      console.warn("API_KEY não encontrada. A IA não será iniciada.");
      return "Chave de API da IA não configurada. Verifique o painel do Vercel.";
    }

    // Initialize AI only when needed
    const ai = new GoogleGenAI({ apiKey: apiKey });

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
    return "Não foi possível gerar a descrição automática. Tente novamente mais tarde.";
  }
};