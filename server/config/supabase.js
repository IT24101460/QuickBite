import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing. Check .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
