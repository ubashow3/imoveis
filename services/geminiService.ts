
import { GoogleGenAI } from "@google/genai";

// Chave fornecida pelo usuário para funcionamento imediato no Vercel
const DIRECT_API_KEY = 'AIzaSyBKn3Szrk29FdUiYrB9IJwe3RBDYS-OARQ';

interface PropertyData {
  title?: string;
  location?: string;
  type?: 'sale' | 'rent_seasonal' | 'rent_longterm';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  price?: number;
  features?: string[];
}

export const generatePropertyDescription = async (data: PropertyData): Promise<string> => {
  try {
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
      return "⚠️ ERRO: Chave da IA não encontrada.";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Formatar valores para o prompt
    const featureList = data.features && data.features.length > 0 ? data.features.join(', ') : 'Não especificadas';
    
    let typeLabel = 'Venda';
    if (data.type === 'rent_seasonal') typeLabel = 'Aluguel de Temporada';
    if (data.type === 'rent_longterm') typeLabel = 'Locação Definitiva (Anual)';

    const priceLabel = data.price ? `R$ ${data.price}` : 'Sob consulta';

    const prompt = `
      Atue como um corretor de imóveis experiente e persuasivo especializado no litoral de Ubatuba.
      Escreva uma descrição atraente, profissional e vendedora (máximo 150 palavras) para este imóvel:

      DADOS DO IMÓVEL:
      - Título do Anúncio: ${data.title || 'Imóvel em Ubatuba'}
      - Tipo de Negócio: ${typeLabel}
      - Localização: ${data.location || 'Ubatuba, SP'}
      - Valor: ${priceLabel}
      - Área Útil: ${data.area ? data.area + 'm²' : 'Não informada'}
      - Quartos: ${data.bedrooms || 0}
      - Banheiros: ${data.bathrooms || 0}
      - Diferenciais/Características: ${featureList}

      DIRETRIZES:
      1. Comece com uma frase de impacto (Hook).
      2. Destaque os pontos fortes. Se for Locação Definitiva, foque em conforto para moradia e contrato anual. Se for Temporada, foque em férias e lazer.
      3. Use os dados numéricos (área, quartos) de forma natural no texto.
      4. Finalize com uma chamada para ação (Call to Action).
      5. Use emojis moderadamente para dar leveza.
      6. NÃO use formatação Markdown (negrito/itálico), apenas texto corrido e parágrafos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Descrição não disponível no momento.";
  } catch (error: any) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return `Erro ao conectar com a IA: ${error.message || "Verifique a conexão."}`;
  }
};
