
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atovqhprjbnlqhzerzbx.supabase.co';
const supabaseAnonKey = 'sb_publishable_f6XW2nNyagBU93TxmkfWpA_JDzQt45L';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
