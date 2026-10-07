#!/bin/sh
# Prepares /data, then runs the container's command: node dist/poll.js by
# default, or e.g. `sleep infinity` to keep it up for a shell.
set -eu

# Without a volume, /data is just a folder inside this container: the Claude
# login, logs and keys vanish when the container is deleted. Easy to miss when
# starting it from Docker Desktop's Run button, which attaches no volume.
if ! mountpoint -q /data; then
  echo "[entrypoint] WARNING: /data is not a volume. The Claude login, logs and keys will be lost when this container is deleted. Start it with -v audit-worker-data:/data." >&2
fi

# A fresh volume gets its layout on first boot; later boots find it there.
mkdir -p /data/home /data/logs /data/output /data/secrets
chmod 700 /data/home /data/secrets

# Railway can't upload files: the GA4/GTM key files may arrive as base64
# variables instead. Unset (as locally), this is skipped.
if [ -n "${GA4_SA_KEY_B64:-}" ]; then
  printf '%s' "$GA4_SA_KEY_B64" | base64 -d > /data/secrets/ga4-sa.json
fi
if [ -n "${GTM_SA_KEY_B64:-}" ]; then
  printf '%s' "$GTM_SA_KEY_B64" | base64 -d > /data/secrets/gtm-sa.json
fi

if [ ! -f "$HOME/.claude/.credentials.json" ] && [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  echo "[entrypoint] Claude isn't logged in yet: open a shell in this container, run 'claude', then /login." >&2
fi

# exec, so the command (not this shell) receives tini's SIGTERM.
exec "$@"
