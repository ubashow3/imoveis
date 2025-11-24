
import { GoogleGenAI } from "@google/genai";

export const generatePropertyDescription = async (
  features: string[],
  location: string,
  type: 'sale' | 'rent_seasonal',
  bedrooms: number
): Promise<string> => {
  try {
    // Tenta obter a chave de forma segura para evitar ReferenceError no navegador
    let apiKey = '';
    try {
      apiKey = process.env.API_KEY || '';
    } catch (e) {
      console.warn("Acesso direto a process.env falhou (ambiente browser).");
    }

    if (!apiKey) {
      return "⚠️ ERRO: Chave da IA não configurada.\n\nVá no painel do Vercel > Settings > Environment Variables e adicione a chave 'API_KEY' com sua credencial do Google AI Studio.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Atue como um corretor de imóveis experiente especializado em imóveis de luxo no litoral de Ubatuba.
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
  } catch (error: any) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return `Erro ao conectar com a IA: ${error.message || "Verifique a chave API_KEY no Vercel."}`;
  }
};
