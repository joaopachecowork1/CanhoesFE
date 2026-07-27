export function isDevelopmentAuthEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV !== "production"
    && env.DEV_AUTH_BYPASS_ENABLED?.trim().toLowerCase() === "true";
}
