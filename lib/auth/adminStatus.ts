export type ResolveAdminStatusInput = {
  authLoading: boolean;
  eventOverviewError: Error | null;
  eventOverviewLoading: boolean;
  isLogged: boolean;
  overviewIsAdmin: boolean;
  profileError: Error | null;
  profileLoading: boolean;
  userIsAdmin: boolean;
};

export function resolveAdminStatus({
  authLoading,
  eventOverviewError,
  eventOverviewLoading,
  isLogged,
  overviewIsAdmin,
  profileError,
  profileLoading,
  userIsAdmin,
}: Readonly<ResolveAdminStatusInput>) {
  const isAdmin = userIsAdmin || overviewIsAdmin;
  const isLoading =
    authLoading ||
    (isLogged &&
      !isAdmin &&
      (profileLoading || (eventOverviewLoading && !eventOverviewError && !profileError)));

  const error = profileError ?? eventOverviewError ?? null;

  return {
    error,
    isAdmin,
    isLoading,
    source: userIsAdmin ? "profile" : overviewIsAdmin ? "overview" : null,
  };
}
