import { supabase } from './src/config/supabaseClient.js';
supabase.from('products').select('*').then(console.log);
