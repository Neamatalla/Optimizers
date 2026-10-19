// Escapes a value for use inside HTML text or a quoted attribute. Used for
// anything a visitor typed that ends up in an email or page we render, so
// form input can't inject markup into our own inboxes.
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
