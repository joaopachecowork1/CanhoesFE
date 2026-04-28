type DevAuthUserConfig = {
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
};

function isFalse(value: string) {
  return value.trim().toLowerCase() === "false";
}

const devAuthBypassEnabledEnv =
  process.env.DEV_AUTH_BYPASS_ENABLED ??
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS_ENABLED ??
  "false";
const devAuthAutoAdminEnv =
  process.env.DEV_AUTH_AUTO_ADMIN ??
  process.env.NEXT_PUBLIC_DEV_AUTH_AUTO_ADMIN ??
  "true";
const devAuthUserIdEnv =
  process.env.DEV_AUTH_USER_ID ??
  process.env.NEXT_PUBLIC_DEV_AUTH_USER_ID ??
  "11111111-1111-1111-1111-111111111111";
const devAuthNameEnv =
  process.env.DEV_AUTH_NAME ??
  process.env.NEXT_PUBLIC_DEV_AUTH_NAME ??
  "Mock Admin";
const devAuthEmailEnv =
  process.env.DEV_AUTH_EMAIL ??
  process.env.NEXT_PUBLIC_DEV_AUTH_EMAIL ??
  "dev@canhoes.com";

/**
 * Dev auth bypass — controlado por variável de ambiente.
 * Definir DEV_AUTH_BYPASS_ENABLED=true para ativar em dev.
 * Em produção deve ser false (omitir ou definir "false").
 */
export const DEV_AUTH_BYPASS_ENABLED =
  devAuthBypassEnabledEnv.trim().toLowerCase() === "true";

export const DEV_AUTH_AUTO_ADMIN_ENABLED =
  DEV_AUTH_BYPASS_ENABLED && !isFalse(devAuthAutoAdminEnv);

export const DEV_AUTH_USER_CONFIG: DevAuthUserConfig = {
  id: devAuthUserIdEnv,
  name: devAuthNameEnv,
  email: devAuthEmailEnv,
  isAdmin: DEV_AUTH_AUTO_ADMIN_ENABLED,
};
