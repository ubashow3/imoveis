
import { GoogleGenAI } from "@google/genai";

// Chave fornecida pelo usuário para funcionamento imediato no Vercel
const DIRECT_API_KEY = 'AIzaSyBKn3Szrk29FdUiYrB9IJwe3RBDYS-OARQ';

export const generatePropertyDescription = async (
  features: string[],
  location: string,
  type: 'sale' | 'rent_seasonal',
  bedrooms: number
): Promise<string> => {
  try {
    // 1. Tenta pegar a chave do ambiente (segurança padrão)
    // 2. Se falhar (comum no Vercel frontend), usa a chave direta fornecida
    let apiKey = '';
    
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignora erro de process is not defined
    }

    if (!apiKey) {
      apiKey = DIRECT_API_KEY;
    }

    if (!apiKey || apiKey.trim() === '') {
      return "⚠️ ERRO: Chave da IA não encontrada. Verifique o arquivo geminiService.ts.";
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
    return `Erro ao conectar com a IA: ${error.message || "Verifique se a chave API é válida."}`;
  }
};
