import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const { data, error } = await sb.storage.from(process.env.AUDIT_REPORTS_BUCKET).download('reports/regal-honey-com-4dcf7d/index.html');
if (error) { console.error(error); process.exit(1); }
const html = await data.text();
console.log('GA4- ids:', (html.match(/GA4-D?\d+/g)||[]).length);
console.log('GTM- ids:', (html.match(/GTM-\d+/g)||[]).length);
const i1 = html.indexOf('Google Analytics 4');
console.log(html.slice(i1, i1+800));
