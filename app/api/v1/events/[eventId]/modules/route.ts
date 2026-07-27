import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthorizationError, requireAdmin } from "@/lib/auth/serverAuth";
import { getEventOverview } from "@/lib/services/eventService";
import { updateEventModules } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

const modulesSchema = z.object({
  feed: z.boolean().optional(),
  secretSanta: z.boolean().optional(),
  wishlist: z.boolean().optional(),
  categories: z.boolean().optional(),
  voting: z.boolean().optional(),
  gala: z.boolean().optional(),
  stickers: z.boolean().optional(),
  measures: z.boolean().optional(),
  nominees: z.boolean().optional(),
}).strict().refine((modules) => Object.keys(modules).length > 0, {
  message: "At least one module is required.",
});

const bodySchema = z.object({ modules: modulesSchema }).strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const actor = await requireAdmin();
    const { eventId } = await params;
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid modules payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await updateEventModules(eventId, parsed.data.modules);
    const overview = await getEventOverview(eventId, actor.id, actor.isAdmin);
    if (!overview) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Event not found." }, { status: 404 });
    }
    return NextResponse.json(overview);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { code: "MODULE_UPDATE_FAILED", message: "Unable to update event modules." },
      { status: 500 }
    );
  }
}
