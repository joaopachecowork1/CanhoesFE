"use client";

import type { PublicUserDto } from "@/lib/api/types";

import { UsersAdmin } from "./UsersAdmin";

type AdminMembersSectionProps = {
  loading: boolean;
  members: PublicUserDto[];
};

export function AdminMembersSection({
  loading,
  members,
}: Readonly<AdminMembersSectionProps>) {
  return <UsersAdmin loading={loading} members={members} />;
}
