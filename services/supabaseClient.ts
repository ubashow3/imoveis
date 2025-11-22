import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnuvfvfksnatezrpxqfj.supabase.co';
// Using the provided secret key to ensure database connection and permissions
const supabaseKey = process.env.SUPABASE_KEY || 'sb_secret_S8vT_Xs5fvipJCyT2uoW1A_IflgEfHI'; 

export const supabase = createClient(supabaseUrl, supabaseKey);