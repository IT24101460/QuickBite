import { createClient } from '@supabase/supabase-js';

// Using the credentials you provided
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ba193764 (.env created for stripe,supabase)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing. Check .env file.");
}
<<<<<<< HEAD
=======
const supabaseUrl = 'https://fjedogqftcjvcptkygwb.supabase.co';
<<<<<<< HEAD
const supabaseKey = 'sb_secret_4tR-Pb8Da2n1lh6kIK02rQ_ktfHW2DV';
>>>>>>> 47c8e939 (progress added,but need improve UI to userfriendly)
=======
const supabaseKey = SUPABASE_KEY;
>>>>>>> f587499b (progress added,but need improve UI to userfriendly)
=======
>>>>>>> ba193764 (.env created for stripe,supabase)

export const supabase = createClient(supabaseUrl, supabaseKey);
