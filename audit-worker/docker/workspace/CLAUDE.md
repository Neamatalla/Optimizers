# You are inside the audit-worker container

- The worker's code is in /app (compiled to /app/dist). It runs `claude -p`
  the same way you're running now, with its own per-audit MCP config.
- Chrome is at /usr/bin/google-chrome-stable. The chrome-devtools MCP server
  in this folder's .mcp.json drives it, headless, with no sandbox.
- /data is the only persistent volume: home folder, logs, output, secrets.
  Everything else resets when the container is rebuilt.
- Claude is billed to ANTHROPIC_API_KEY (API credits), here as in the
  worker's runs, so this session costs money too. Don't /login.
- There's no display. Save screenshots and other files for the person
  testing under /data/output; they copy them out with `docker cp`.
