// Module hook for the local pipeline run: when poll.ts imports ./supabase.js
// or ./email.js, hand it the fakes in this folder instead. Nothing else is
// swapped, so every other module is the production code.
// Both spellings: tsx rewrites "./supabase.js" to "./supabase.ts" before
// later hooks see it.
const SWAP = {
  "./supabase.js": "./fake-supabase.ts", "./supabase.ts": "./fake-supabase.ts",
  "./email.js": "./fake-email.ts", "./email.ts": "./fake-email.ts",
};

export async function resolve(specifier, context, next) {
  if (SWAP[specifier] && /[\\/]src[\\/]poll\.ts$/.test(new URL(context.parentURL ?? "file:///").pathname)) {
    return next(new URL(SWAP[specifier], import.meta.url).href, context);
  }
  return next(specifier, context);
}
