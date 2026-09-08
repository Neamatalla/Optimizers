import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const { data, error } = await sb.storage.from(process.env.AUDIT_REPORTS_BUCKET).download('reports/regal-honey-com-4dcf7d/index.html');
if (error) { console.error(error); process.exit(1); }
const html = await data.text();
const ids = new Set((html.match(/WEB-\d+/g)||[]));
console.log('unique WEB ids:', ids.size, [...ids].sort());
const h2s = html.match(/<h[23][^>]*>[^<]*<\/h[23]>/g);
console.log('headings:', h2s);
