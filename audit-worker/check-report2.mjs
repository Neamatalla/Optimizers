import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const { data, error } = await sb.storage.from(process.env.AUDIT_REPORTS_BUCKET).download('reports/regal-honey-com-4dcf7d/index.html');
if (error) { console.error(error); process.exit(1); }
const html = await data.text();
console.log('mentions Website:', (html.match(/Website/g)||[]).length);
console.log('mentions PS-:', (html.match(/PS-\d/g)||[]).length);
console.log('mentions WEB-:', (html.match(/WEB-\d+/g)||[]).length);
console.log('mentions /50', (html.match(/\/\s?50/g)||[]));
console.log('mentions score', html.match(/(\d+)\s*\/\s*(\d+)/g)?.slice(0,10));
