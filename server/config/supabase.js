import { createClient } from '@supabase/supabase-js';

// Using the credentials you provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing. Check .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
