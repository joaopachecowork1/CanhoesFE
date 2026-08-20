import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/domains/auth/services/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAtUtc = new Date();
    expiresAtUtc.setDate(expiresAtUtc.getDate() + 7); // 7 days from now

    // Upsert invitation (in case they were invited before and it expired)
    await prisma.userInvitation.upsert({
      where: { email },
      update: {
        token,
        expiresAtUtc,
        invitedByUserId: session.user.id,
        usedAtUtc: null,
      },
      create: {
        email,
        token,
        expiresAtUtc,
        invitedByUserId: session.user.id,
      },
    });

    // TODO: Send email here using Resend or similar
    console.log(`[INVITE SYSTEM] Invitation link for ${email}: /canhoes/register?token=${token}`);

    return NextResponse.json({ 
      success: true, 
      message: "Invitation generated successfully.",
      // For development, we return the token/link so it's easy to test without an email provider
      inviteUrl: `/canhoes/register?token=${token}`
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
