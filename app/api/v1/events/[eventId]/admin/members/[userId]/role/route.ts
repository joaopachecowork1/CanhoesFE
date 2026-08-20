import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthorizationError, requireAdmin } from "@/lib/domains/auth/services/serverAuth";
import { setAdminRole } from "@/lib/domains/admin/services/members";

const roleBodySchema = z.object({
  isAdmin: z.boolean(),
  confirmSelfDemotion: z.boolean().optional().default(false),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; userId: string }> }
) {
  try {
    const actor = await requireAdmin();
    const { eventId, userId } = await params;
    const parsed = roleBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid admin role payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await setAdminRole({
      actorUserId: actor.id,
      eventId,
      targetUserId: userId,
      ...parsed.data,
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    const code = error instanceof Error ? error.message : "ROLE_UPDATE_FAILED";
    const status = code === "MEMBER_NOT_FOUND" ? 404 : code === "ROLE_UPDATE_FAILED" ? 500 : 409;
    return NextResponse.json({ code, message: code.replaceAll("_", " ").toLowerCase() }, { status });
  }
}
