import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const { data, error } = await sb.from('audit_requests').update({ status: 'pending' }).eq('id', '4dcf7dc8-0c71-49ff-87e5-f3c74dbc1c3a').select().single();
if (error) { console.error(error); process.exit(1); }
console.log(JSON.stringify(data));
