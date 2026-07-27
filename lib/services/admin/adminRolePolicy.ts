export type AdminRoleChange = {
  actorUserId: string;
  targetUserId: string;
  targetIsAdmin: boolean;
  nextIsAdmin: boolean;
  adminCount: number;
  confirmSelfDemotion: boolean;
};

export function assertAdminRoleChangeAllowed(change: AdminRoleChange) {
  const isDemotion = change.targetIsAdmin && !change.nextIsAdmin;
  if (!isDemotion) return;

  if (change.actorUserId === change.targetUserId && !change.confirmSelfDemotion) {
    throw new Error("SELF_DEMOTION_CONFIRMATION_REQUIRED");
  }

  if (change.adminCount <= 1) {
    throw new Error("LAST_ADMIN_REQUIRED");
  }
}
