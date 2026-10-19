import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { appendFileSync, mkdirSync } from 'fs'
import { inspect } from 'util'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { apiBridgePlugin } from './dev/api-bridge'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Tees every console.* call (dev-server startup, and every /api/* request
// run by dev/api-bridge.ts) to a daily log file, so requests coming in
// through the tmole tunnel are captured even with no one watching the
// terminal. Same approach as audit-worker/src/logger.ts.
const devLogDir = path.join(__dirname, 'logs')
mkdirSync(devLogDir, { recursive: true })
function currentDevLogFile() {
  return path.join(devLogDir, `dev-server-${new Date().toISOString().slice(0, 10)}.log`)
}
function formatLogArgs(args: unknown[]): string {
  return args.map(a => (typeof a === 'string' ? a : inspect(a, { depth: 4 }))).join(' ')
}
function wrapConsole(level: string, original: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    original(...args)
    try {
      appendFileSync(currentDevLogFile(), `[${new Date().toISOString()}] [${level}] ${formatLogArgs(args)}\n`)
    } catch {
      // Logging must never crash the dev server — stdout already has it either way.
    }
  }
}
console.log = wrapConsole('LOG', console.log.bind(console))
console.info = wrapConsole('INFO', console.info.bind(console))
console.warn = wrapConsole('WARN', console.warn.bind(console))
console.error = wrapConsole('ERROR', console.error.bind(console))

export default defineConfig({
  cacheDir: '/tmp/vite-cache',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Runs the real /api handlers in dev — see dev/api-bridge.ts.
    apiBridgePlugin(),
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
