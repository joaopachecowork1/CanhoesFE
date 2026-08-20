export type ResolveAdminStatusInput = {
  authLoading: boolean;
  isLogged: boolean;
  profileError: Error | null;
  profileLoading: boolean;
  userIsAdmin: boolean;
};

export function resolveAdminStatus({
  authLoading,
  isLogged,
  profileError,
  profileLoading,
  userIsAdmin,
}: Readonly<ResolveAdminStatusInput>) {
  const isAdmin = isLogged && userIsAdmin;
  const isLoading = authLoading || (isLogged && !isAdmin && profileLoading);

  return {
    error: profileError,
    isAdmin,
    isLoading,
    source: isAdmin ? "profile" : null,
  };
}
