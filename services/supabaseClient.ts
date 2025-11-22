import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL fixa do seu projeto
const supabaseUrl = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// Chave fornecida.
// Tenta usar a chave anon se disponível, ou a chave publishable fornecida como fallback
const DEFAULT_ANON_KEY = 'sb_publishable__hwpGDsikmzyMKKxiFtj1w_JrGA975Q';

let supabaseInstance: SupabaseClient;

try {
  // Tenta obter a chave de várias fontes de ambiente ou usa a padrão
  let key = DEFAULT_ANON_KEY;
  try {
    if (typeof process !== 'undefined' && process.env) {
      key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || DEFAULT_ANON_KEY;
    }
  } catch (e) {
    // Ignora erro de acesso ao process.env em navegadores antigos
  }

  // Validação básica
  if (!supabaseUrl) {
    throw new Error("URL do Supabase ausente.");
  }

  console.log("Iniciando Supabase com URL:", supabaseUrl);
  
  // Inicializa o cliente
  // Nota: Se a chave for inválida, operações futuras falharão, mas o createClient geralmente não lança erro síncrono
  supabaseInstance = createClient(supabaseUrl, key);

} catch (error) {
  console.error("CRITICAL SUPABASE INIT ERROR (Client Fallback Activated):", error);
  
  // MOCK CLIENT: Permite que o site abra mesmo se a configuração do banco estiver quebrada.
  // Isso previne a Tela Branca da Morte.
  const mockErrorResponse = { 
    data: null, 
    error: { 
      message: "Erro Crítico de Inicialização: Chave de API inválida ou Bloqueio de CORS. Verifique o console.",
      code: "CLIENT_INIT_ERROR",
      details: String(error)
    } 
  };
  
  // Cria um objeto que imita a estrutura do Supabase para não quebrar o App.tsx
  supabaseInstance = {
    from: () => ({
      select: () => Promise.resolve(mockErrorResponse),
      insert: () => Promise.resolve(mockErrorResponse),
      update: () => Promise.resolve(mockErrorResponse),
      delete: () => Promise.resolve(mockErrorResponse),
      upsert: () => Promise.resolve(mockErrorResponse),
      order: () => Promise.resolve(mockErrorResponse),
    })
  } as unknown as SupabaseClient;
}

export const supabase = supabaseInstance;