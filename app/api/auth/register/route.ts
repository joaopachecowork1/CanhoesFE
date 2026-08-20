import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password, displayName } = body;

    if (!token || !password || !displayName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Find valid invitation
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 });
    }

    if (invitation.usedAtUtc) {
      return NextResponse.json({ error: "Invitation has already been used" }, { status: 400 });
    }

    if (invitation.expiresAtUtc < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    const email = invitation.email;

    // We use a transaction to ensure both user creation and invite invalidation happen together
    const result = await prisma.$transaction(async (tx) => {
      // Mark invitation as used
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { usedAtUtc: new Date() },
      });

      // Create or update the user
      // If the user somehow exists (e.g., they logged in via Google but now want a password), we just update them.
      const existingUser = await tx.user.findUnique({ where: { email } });
      
      let user;
      if (existingUser) {
        user = await tx.user.update({
          where: { email },
          data: {
            passwordHash,
            displayName: existingUser.displayName || displayName,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            email,
            externalId: `credentials:${email}`,
            displayName,
            passwordHash,
            isAdmin: false,
          },
        });
      }
      
      return user;
    });

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully. You can now login.",
      user: { email: result.email, name: result.displayName }
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
