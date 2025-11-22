import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnuvfvfksnatezrpxqfj.supabase.co';
// Using the Public/Anon key for browser usage. 
// Secret keys (service_role) cannot be used in client-side code.
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable__hwpGDsikmzyMKKxiFtj1w_JrGA975Q'; 

export const supabase = createClient(supabaseUrl, supabaseKey);