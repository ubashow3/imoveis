import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO PADRÃO (FALLBACK) ---
// Estas chaves são usadas apenas se NÃO houver chaves configuradas no Instalador (LocalStorage)
const DEFAULT_URL = 'https://vnuvfvfksnatezrpxqfj.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudXZmdmZrc25hdGV6cnB4cWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODY5NDMsImV4cCI6MjA3OTM2Mjk0M30.Zut19NVh5Fho6E_9PIiyC_tO9hOyszhiQg0LMhaubuA';

// Tenta pegar do LocalStorage (Fluxo de Agência/Instalador)
const getLocalCredentials = () => {
  try {
    const localUrl = localStorage.getItem('sb_url');
    const localKey = localStorage.getItem('sb_key');
    if (localUrl && localKey) {
      console.log("Supabase: Usando credenciais personalizadas do Instalador.");
      return { url: localUrl, key: localKey };
    }
  } catch (e) {
    // Ignora erro se localStorage não estiver disponível
  }
  return { url: DEFAULT_URL, key: DEFAULT_KEY };
};

const creds = getLocalCredentials();

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
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: "Mock Upload Error" } }),
        getPublicUrl: () => ({ data: { publicUrl: "" } })
      })
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  } as unknown as SupabaseClient;
};

let supabaseInstance: SupabaseClient;

try {
  // Inicialização segura
  if (!creds.url || !creds.key) throw new Error("Credenciais inválidas ou vazias.");
  supabaseInstance = createClient(creds.url, creds.key.trim());
  console.log("Supabase: Cliente iniciado com sucesso.");
} catch (error: any) {
  console.error("Supabase: Erro fatal:", error);
  supabaseInstance = createMockClient(error.message || "Erro desconhecido");
}

// Funções auxiliares para o Instalador
export const updateSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_key', key);
  window.location.reload(); // Recarrega para aplicar as novas chaves
};

export const resetSupabaseCredentials = () => {
  localStorage.removeItem('sb_url');
  localStorage.removeItem('sb_key');
  window.location.reload();
};

export const supabase = supabaseInstance;