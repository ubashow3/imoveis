import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL do seu projeto
const SUPABASE_URL = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// SUA CHAVE PÚBLICA (ANON) CORRETA
// Configurada diretamente para garantir que funcione no Vercel sem variaveis de ambiente
const VALID_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudXZmdmZrc25hdGV6cnB4cWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODY5NDMsImV4cCI6MjA3OTM2Mjk0M30.Zut19NVh5Fho6E_9PIiyC_tO9hOyszhiQg0LMhaubuA';

let supabaseInstance: SupabaseClient;

// Função para criar um cliente falso caso algo muito grave aconteça (evita tela branca)
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
        code: "CONNECTION_ERROR"
      } 
    })
  };
  return { from: () => mockBuilder } as unknown as SupabaseClient;
};

try {
  // Tenta criar o cliente com a chave fixa correta
  supabaseInstance = createClient(SUPABASE_URL, VALID_KEY);
  console.log("Supabase conectado com sucesso.");
} catch (error) {
  console.error("Erro fatal ao iniciar Supabase:", error);
  supabaseInstance = createMockClient("Erro na inicialização do cliente Supabase.");
}

export const supabase = supabaseInstance;