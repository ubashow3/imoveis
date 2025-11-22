import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL fixa do seu projeto
const supabaseUrl = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// Chave fornecida.
// IMPORTANTE: Chaves do Supabase geralmente começam com "ey...". 
// Se a sua começa com "sb_publishable", ela pode não funcionar diretamente com esta biblioteca.
// Mas vamos tentar usá-la de forma segura.
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

  // Tenta inicializar o cliente real
  if (!supabaseUrl || !key) {
    throw new Error("URL ou Key do Supabase ausentes.");
  }
  
  // Inicializa o cliente. Se a chave for inválida, o Supabase pode não lançar erro aqui, 
  // mas sim nas chamadas subsequentes (select, insert, etc).
  supabaseInstance = createClient(supabaseUrl, key);

} catch (error) {
  console.error("CRITICAL SUPABASE INIT ERROR (Client Fallback Activated):", error);
  
  // MOCK CLIENT: Permite que o site abra mesmo se a configuração do banco estiver quebrada.
  const mockErrorResponse = { 
    data: null, 
    error: { 
      message: "Erro Crítico de Inicialização: Chave de API inválida ou Bloqueio de CORS.",
      code: "CLIENT_INIT_ERROR"
    } 
  };
  
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