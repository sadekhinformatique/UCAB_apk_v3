
import { createClient } from '@supabase/supabase-js';

// Access variables injected by Vite's `define` config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Key is missing. Please check your Render Environment Variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
