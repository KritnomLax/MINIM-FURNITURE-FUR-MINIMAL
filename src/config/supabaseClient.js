import { createClient } from '@supabase/supabase-js';

// ค่าเหล่านี้จะถูกอ่านจากไฟล์ .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL being used:', supabaseUrl);

// สร้าง instance สำหรับเชื่อมต่อฐานข้อมูล
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
