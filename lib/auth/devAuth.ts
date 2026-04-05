type DevAuthUserConfig = {
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
};

function readEnv(publicKey: string, privateKey: string, fallback: string) {
  return process.env[publicKey] ?? process.env[privateKey] ?? fallback;
}

function isTrue(value: string) {
  return value.trim().toLowerCase() === "true";
}

function isFalse(value: string) {
  return value.trim().toLowerCase() === "false";
}

const bypassFlag = readEnv("NEXT_PUBLIC_DEV_AUTH_BYPASS", "DEV_AUTH_BYPASS", "false");
const autoAdminFlag = readEnv("NEXT_PUBLIC_DEV_AUTH_AUTO_ADMIN", "DEV_AUTH_AUTO_ADMIN", "true");

// Temporary emergency mode: keep auth mocked everywhere until OAuth is restored.
// Revert this to env-based logic before enabling real authentication again.
export const DEV_AUTH_BYPASS_ENABLED = true;

export const DEV_AUTH_AUTO_ADMIN_ENABLED =
  DEV_AUTH_BYPASS_ENABLED && !isFalse(autoAdminFlag);

export const DEV_AUTH_USER_CONFIG: DevAuthUserConfig = {
  id: readEnv("NEXT_PUBLIC_DEV_AUTH_USER_ID", "DEV_AUTH_USER_ID", "dev-admin-001"),
  name: readEnv("NEXT_PUBLIC_DEV_AUTH_NAME", "DEV_AUTH_NAME", "Dev Admin"),
  email: readEnv(
    "NEXT_PUBLIC_DEV_AUTH_EMAIL",
    "DEV_AUTH_EMAIL",
    "dev-admin@canhoes.local"
  ),
  isAdmin: DEV_AUTH_AUTO_ADMIN_ENABLED,
};
