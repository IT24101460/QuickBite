import { createClient } from '@supabase/supabase-js';

// Using the credentials you provided
const supabaseUrl = 'https://fjedogqftcjvcptkygwb.supabase.co';
const supabaseKey = SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
