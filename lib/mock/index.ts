/**
 * Mock mode utilities.
 *
 * Enabled by default in development so the app works without a running backend
 * or Google OAuth credentials. Disable explicitly with NEXT_PUBLIC_MOCK_AUTH=false.
 *
 * In production this is always false — mock code never runs in deployed builds.
 *
 * Usage (dev, mock ON — default):
 *   npm run dev
 *
 * Usage (dev, mock OFF — needs real backend + Google OAuth):
 *   NEXT_PUBLIC_MOCK_AUTH=false npm run dev
 */

/**
 * Mock data mode is opt-in only.
 * Use it only when you explicitly want static fixtures instead of backend data.
 */
export const IS_MOCK_MODE: boolean =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

export { IS_MOCK_MODE as IS_LOCAL_MODE };
