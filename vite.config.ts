import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Plugin to handle /api/contact locally during dev
function apiMiddlewarePlugin() {
  return {
    name: 'api-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/contact', async (req: any, res: any, next: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const env = loadEnv('development', process.cwd(), '');
            const apiKey = env.RESEND_API_KEY || "re_ZCdaNrsb_8diHsNULEJzscD2Chs2sEDay";
            if (!apiKey) {
              console.warn("RESEND_API_KEY is missing in .env. Mocking success for development form testing.");
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Mock success: API key missing' }));
              return;
            }

            const { Resend } = await import('resend');
            const resend = new Resend(apiKey);
            const { firstName, email, website, monthlyConversions, challenge } = JSON.parse(body);

            if (!firstName || !email) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'First name and email are required.' }));
              return;
            }

            const { data, error } = await resend.emails.send({
              from: 'Optimizers <onboarding@resend.dev>',
              to: ['mohamed@neamatalla.com'],
              subject: `New Optimizers Client Data Submission from ${firstName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
                    New Contact Form Submission
                  </h2>
                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background-color: #f5f5f5;">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">First Name</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${firstName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Website</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${website || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Conversion Volume</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${monthlyConversions || 'N/A'}</td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Primary Objective</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${challenge || 'N/A'}</td>
                    </tr>
                  </table>
                  <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                    This submission was received from the Optimizers booking form.
                  </p>
                </div>
              `.trim(),
            });

            if (error) {
              console.error('Resend API Error:', JSON.stringify(error));
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (error as any).message || 'Resend API error' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Strategy session inquiry received successfully!', data }));
          } catch (err: any) {
            console.error('Dev API error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Unexpected error' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  cacheDir: '/tmp/vite-cache',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    apiMiddlewarePlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4000,
    allowedHosts: true,
  },
})
