import { createClient } from '@supabase/supabase-js';

// We pull the keys we just saved in .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// SINGLETON PATTERN: 
// By creating this instance here and exporting it, we ensure that the 
// entire app shares one single connection 'pipe' to Supabase.
export const supabase = createClient(supabaseUrl, supabaseKey);