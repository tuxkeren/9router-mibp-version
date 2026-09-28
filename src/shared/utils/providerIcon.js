// Provider icon paths under /public/providers.
// Alias related brands; session-cache 404s so one miss never spams again.
// All returned paths carry the Next.js basePath so they resolve when the app
// is served from a subpath (e.g. https://host/9route).

const ICON_ALIASES = {
  "perplexity-agent": "perplexity",
  "gitlab-duo": "gitlab",
  "vercel-ai-gateway": "vercel",
  "ollama-search": "ollama",
};

// Runtime only — first 404 remembers id for the whole session
const failedIds = new Set();

function normalizeId(providerId) {
  if (!providerId || typeof providerId !== "string") return "";
  return providerId.trim().toLowerCase();
}

/**
 * Resolve the app's basePath (e.g. "/9route").
 *
 * Next.js auto-prefixes <Link>/<Image> but NOT hand-built asset strings, so the
 * value is re-exposed to the client bundle via `env.NEXT_PUBLIC_BASE_PATH` in
 * next.config.mjs. Keep both in sync — BASE_PATH there is the single constant.
 */
function getBasePath() {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  return "";
}

/**
 * Prefix a public/absolute asset path with the app basePath.
 * Idempotent: a path that already starts with the basePath is left alone.
 */
export function withBasePath(path) {
  if (!path || typeof path !== "string" || !path.startsWith("/")) return path;
  const base = getBasePath();
  if (!base || base === "/") return path;
  if (path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}

/** Resolve icon file id (after alias). Empty if previously failed this session. */
export function resolveProviderIconId(providerId) {
  const id = normalizeId(providerId);
  if (!id) return "";
  if (failedIds.has(id)) return "";
  const aliased = ICON_ALIASES[id] || id;
  if (failedIds.has(aliased)) return "";
  return aliased;
}

/** `${basePath}/providers/{id}.png` or null when previously failed. */
export function getProviderIconSrc(providerId) {
  const id = resolveProviderIconId(providerId);
  return id ? withBasePath(`/providers/${id}.png`) : null;
}

/** Call from img onError so later mounts skip the request. */
export function markProviderIconMissing(providerId) {
  const id = normalizeId(providerId);
  if (id) failedIds.add(id);
  const aliased = ICON_ALIASES[id];
  if (aliased) failedIds.add(aliased);
}
