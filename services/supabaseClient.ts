import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO BLINDADA ---
// URL do projeto
const SUPABASE_URL = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// CHAVE PÚBLICA (ANON) CORRETA
const VALID_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudXZmdmZrc25hdGV6cnB4cWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODY5NDMsImV4cCI6MjA3OTM2Mjk0M30.Zut19NVh5Fho6E_9PIiyC_tO9hOyszhiQg0LMhaubuA';

let supabaseInstance: SupabaseClient;

// Função Mock para evitar crash (Tela Branca)
const createMockClient = (errorMessage: string) => {
  console.error("Ativando Mock Client devido a erro:", errorMessage);
  const mockBuilder = {
    select: () => mockBuilder,
    order: () => mockBuilder,
    eq: () => mockBuilder,
    single: () => mockBuilder,
    insert: () => mockBuilder,
    upsert: () => mockBuilder,
    delete: () => mockBuilder,
    limit: () => mockBuilder,
    then: (resolve: any) => resolve({ 
      data: null, 
      error: { 
        message: errorMessage,
        code: "CONNECTION_ERROR",
        details: "Falha crítica na inicialização do cliente."
      } 
    })
  };
  
  return { 
    from: () => mockBuilder,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  } as unknown as SupabaseClient;
};

try {
  // Inicialização segura
  supabaseInstance = createClient(SUPABASE_URL, VALID_KEY.trim());
  console.log("Supabase: Cliente iniciado.");
} catch (error: any) {
  console.error("Supabase: Erro fatal:", error);
  supabaseInstance = createMockClient(error.message || "Erro desconhecido");
}

export const supabase = supabaseInstance;