import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL fixa do seu projeto
const supabaseUrl = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// Chave fornecida. OBS: Se esta chave não for um JWT padrão (começando com 'ey...'), 
// o createClient pode falhar. Por isso adicionamos proteção abaixo.
const DEFAULT_ANON_KEY = 'sb_publishable__hwpGDsikmzyMKKxiFtj1w_JrGA975Q';

let supabaseInstance: SupabaseClient;

try {
  // Tenta obter a chave de várias fontes
  let key = DEFAULT_ANON_KEY;
  try {
    if (typeof process !== 'undefined' && process.env) {
      key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || DEFAULT_ANON_KEY;
    }
  } catch (e) {
    // Ignora erro de acesso ao process.env
  }

  // Tenta inicializar o cliente real
  if (!supabaseUrl || !key) {
    throw new Error("URL ou Key do Supabase ausentes.");
  }
  
  supabaseInstance = createClient(supabaseUrl, key);

} catch (error) {
  console.error("CRITICAL SUPABASE INIT ERROR (Client Fallback Activated):", error);
  
  // MOCK CLIENT: Permite que o site abra mesmo se a configuração do banco estiver quebrada.
  // Retorna erros formatados para que o App.tsx mostre na tela ao invés de travar.
  const mockErrorResponse = { 
    data: null, 
    error: { 
      message: "Erro Crítico de Inicialização: Chave de API inválida ou Bloqueio de CORS. Verifique as configurações do Vercel.",
      code: "CLIENT_INIT_ERROR"
    } 
  };
  
  // Cria um objeto falso que imita o Supabase mas só retorna erro
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