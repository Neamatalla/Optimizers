# syntax=docker/dockerfile:1.7
# Audit worker image: everything the worker needs, nothing from the host.
# Build context is audit-worker/. linux/amd64 only (Google ships no Linux
# arm64 Chrome). Persistent state lives on ONE volume mounted at /data
# (Railway allows one per service) — see docker/entrypoint.sh.

# ---------- build: compile TypeScript ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:24-bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive

# tini: PID 1, forwards SIGTERM to node, reaps claude/Chrome children.
# Noto: Arabic and emoji glyphs in site screenshots. git/less/procps: for
# whoever opens a shell in the container.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg tini git less procps \
      fonts-noto-core fonts-noto-color-emoji \
 && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub \
      | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
      > /etc/apt/sources.list.d/google-chrome.list \
 && apt-get update && apt-get install -y --no-install-recommends google-chrome-stable \
 && rm -rf /var/lib/apt/lists/*

# Claude Code, pinned to the version the laptop runs. Bump on purpose.
ARG CLAUDE_CODE_VERSION=2.1.291
RUN npm install -g --no-audit --allow-scripts=@anthropic-ai/claude-code \
      @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} \
 && npm cache clean --force

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY assets ./assets
# logger.ts writes ./logs and run-metrics.ts writes ./output: both go to the
# volume. entrypoint.sh creates the targets before anything runs.
RUN ln -s /data/logs /app/logs && ln -s /data/output /app/output

# GA4 / GTM MCP servers (Omar's projects) go here once we have their code:
# COPY vendor/mcp /opt/mcp
# RUN cd /opt/mcp/ga4-admin-mcp && npm ci --omit=dev \
#  && cd /opt/mcp/gtm-mcp && npm ci --omit=dev

# Baked Claude config for interactive sessions opened in /workspace. Kept
# out of /app so the worker's own `claude -p` runs don't pick it up, and out
# of /data so the volume can't hide it.
COPY docker/workspace /workspace
# A project can't approve its own .mcp.json servers; managed settings (the
# image-level layer) can. Only affects folders with an .mcp.json, i.e.
# /workspace — /app has none.
COPY docker/managed-settings.json /etc/claude-code/managed-settings.json
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# HOME on the volume: Claude's login (.claude/.credentials.json), its
# .claude.json and history survive container rebuilds and redeploys.
ENV NODE_ENV=production \
    TZ=UTC \
    HOME=/data/home \
    DISABLE_AUTOUPDATER=1 \
    CLAUDE_BIN=claude \
    CHROME_PATH=/usr/bin/google-chrome-stable \
    CHROME_NO_SANDBOX=1

ENTRYPOINT ["tini", "--", "entrypoint.sh"]
CMD ["node", "dist/poll.js"]
