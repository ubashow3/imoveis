import { createClient } from '@supabase/supabase-js';

// URL fixa do seu projeto
const supabaseUrl = 'https://vnuvfvfksnatezrpxqfj.supabase.co';

// Chave Pública (Anon) fixa. 
// É seguro usar essa chave no front-end se o RLS (Row Level Security) estiver ativado no banco.
const DEFAULT_ANON_KEY = 'sb_publishable__hwpGDsikmzyMKKxiFtj1w_JrGA975Q';

// Helper para tentar pegar do env var com segurança
const getSupabaseKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.SUPABASE_KEY) {
      return process.env.SUPABASE_KEY;
    }
  } catch (e) {
    // Ignora
  }
  return DEFAULT_ANON_KEY;
};

const supabaseKey = getSupabaseKey();

// Create client only if URL is present to avoid crashes
export const supabase = createClient(supabaseUrl, supabaseKey);