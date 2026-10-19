# Optimizers website

Landing page for Optimizers (optimizers.agency), a CRO agency for e-commerce brands in the GCC/MENA region. React 18 + TypeScript, Vite, Tailwind CSS v4. Deployed on Vercel.

## Running the code

```
npm i
npm run dev     # http://localhost:5173
npm test        # API tests, offline
npm run build
```

Copy `.env.example` to `.env` for the API keys. The dev server runs the real `/api` handlers and works without them (see `dev/api-bridge.ts`).

The audit worker in `audit-worker/` is a separate project with its own README.
