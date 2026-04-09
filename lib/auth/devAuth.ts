type DevAuthUserConfig = {
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
};

function readEnv(publicKey: string, privateKey: string, fallback: string) {
  return process.env[publicKey] ?? process.env[privateKey] ?? fallback;
}

function isFalse(value: string) {
  return value.trim().toLowerCase() === "false";
}

const autoAdminFlag = readEnv("NEXT_PUBLIC_DEV_AUTH_AUTO_ADMIN", "DEV_AUTH_AUTO_ADMIN", "true");

/**
 * Dev auth bypass — controlado por variável de ambiente.
 * Definir NEXT_PUBLIC_DEV_AUTH_BYPASS_ENABLED=true para ativar em dev.
 * Em produção deve ser false (omitir ou definir "false").
 */
export const DEV_AUTH_BYPASS_ENABLED =
  readEnv("NEXT_PUBLIC_DEV_AUTH_BYPASS_ENABLED", "DEV_AUTH_BYPASS_ENABLED", "false").trim().toLowerCase() === "true";

export const DEV_AUTH_AUTO_ADMIN_ENABLED =
  DEV_AUTH_BYPASS_ENABLED && !isFalse(autoAdminFlag);

export const DEV_AUTH_USER_CONFIG: DevAuthUserConfig = {
  id: readEnv(
    "NEXT_PUBLIC_DEV_AUTH_USER_ID",
    "DEV_AUTH_USER_ID",
    "11111111-1111-1111-1111-111111111111"
  ),
  name: readEnv("NEXT_PUBLIC_DEV_AUTH_NAME", "DEV_AUTH_NAME", "Mock Admin"),
  email: readEnv(
    "NEXT_PUBLIC_DEV_AUTH_EMAIL",
    "DEV_AUTH_EMAIL",
    "dev@canhoes.com"
  ),
  isAdmin: DEV_AUTH_AUTO_ADMIN_ENABLED,
};
