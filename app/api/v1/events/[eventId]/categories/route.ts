import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { apiResponse, unauthorized, apiError } from "@/lib/api/response";
import type { EventCategoryDto, PagedResult } from "@/lib/api/types";
import { PagedParamsSchema } from "@/lib/zod/common";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return apiError("MODULE_DISABLED", "Categories module not available.", 403);
  }

  const searchParams = req.nextUrl.searchParams;
  const parsed = PagedParamsSchema.safeParse({
    skip: searchParams.get("skip") ?? undefined,
    take: searchParams.get("take") ?? undefined,
  });
  const skip = parsed.success ? parsed.data.skip : 0;
  const take = parsed.success ? parsed.data.take : 50;

  const where = { eventId, isActive: true };
  const [items, total] = await Promise.all([
    prisma.awardCategory.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip,
      take,
    }),
    prisma.awardCategory.count({ where }),
  ]);

  const result: PagedResult<EventCategoryDto> = {
    items: items.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      name: c.name,
      kind: c.kind,
      isActive: c.isActive,
      description: c.description,
    })),
    total,
    skip,
    take,
    hasMore: skip + take < total,
  };

  return apiResponse(result);
}
