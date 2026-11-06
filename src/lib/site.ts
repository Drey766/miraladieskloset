/**
 * The site's public origin, e.g. "https://sneakerskenya.vercel.app".
 *
 * Never throws: an empty, missing or slightly-wrong NEXT_PUBLIC_SITE_URL (say, no "https://")
 * must not be able to break the build. Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL
 *   2. the production domain Vercel assigns to the project
 *   3. the current deployment's URL on Vercel
 *   4. http://localhost:3000
 */
const FALLBACK = "http://localhost:3000";

export function getSiteUrl(): string {
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelDeploy = process.env.VERCEL_URL?.trim();
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (vercelProd ? `https://${vercelProd}` : "") ||
    (vercelDeploy ? `https://${vercelDeploy}` : "") ||
    FALLBACK;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK;
  }
}
