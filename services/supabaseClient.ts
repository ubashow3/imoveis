import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- ATUALIZAÇÃO VERCEL FIX ---
// URL do projeto
const SUPABASE_URL = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// CHAVE PÚBLICA (ANON)
// Inserida diretamente para garantir funcionamento no Vercel
const VALID_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudXZmdmZrc25hdGV6cnB4cWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODY5NDMsImV4cCI6MjA3OTM2Mjk0M30.Zut19NVh5Fho6E_9PIiyC_tO9hOyszhiQg0LMhaubuA';

let supabaseInstance: SupabaseClient;

// Função para criar um cliente falso caso algo grave aconteça (evita tela branca)
const createMockClient = (errorMessage: string) => {
  console.error("Ativando Mock Client devido a erro:", errorMessage);
  
  // Mock chainable builder para evitar crash de .select() is not a function
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
        details: "Verifique o console para mais detalhes. (Chave ou URL inválida)"
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
  // Tenta criar o cliente com a chave fixa correta
  if (!VALID_KEY || !VALID_KEY.startsWith('ey')) {
     throw new Error("Formato de chave inválido (deve começar com 'ey').");
  }
  
  // O trim() remove espaços em branco acidentais na cópia
  supabaseInstance = createClient(SUPABASE_URL, VALID_KEY.trim());
  console.log("Supabase: Cliente iniciado com sucesso (Versão Blindada).");
} catch (error: any) {
  console.error("Supabase: Erro fatal na inicialização:", error);
  supabaseInstance = createMockClient(error.message || "Erro desconhecido na inicialização");
}

export const supabase = supabaseInstance;