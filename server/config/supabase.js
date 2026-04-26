import { createClient } from '@supabase/supabase-js';

// Using the credentials you provided
const supabaseUrl = 'https://fjedogqftcjvcptkygwb.supabase.co';
const supabaseKey = 'sb_secret_4tR-Pb8Da2n1lh6kIK02rQ_ktfHW2DV';

export const supabase = createClient(supabaseUrl, supabaseKey);
