-- Schema changes that reached schema.prisma without a migration.
-- Idempotent on purpose: databases created with `prisma db push` (the Docker image) already have them.

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "PasswordHash" TEXT;

ALTER TABLE "CategoryProposals" ADD COLUMN IF NOT EXISTS "Kind" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "HubPostComments" ADD COLUMN IF NOT EXISTS "ReplyToId" VARCHAR(64);
CREATE INDEX IF NOT EXISTS "IX_HubPostComments_ReplyToId" ON "HubPostComments"("ReplyToId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HubPostComments_ReplyToId_fkey') THEN
    ALTER TABLE "HubPostComments" ADD CONSTRAINT "HubPostComments_ReplyToId_fkey"
      FOREIGN KEY ("ReplyToId") REFERENCES "HubPostComments"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "UserInvitations" (
    "Id" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Token" TEXT NOT NULL,
    "InvitedByUserId" UUID NOT NULL,
    "ExpiresAtUtc" TIMESTAMPTZ(6) NOT NULL,
    "UsedAtUtc" TIMESTAMPTZ(6),
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EventId" TEXT,

    CONSTRAINT "PK_UserInvitations" PRIMARY KEY ("Id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserInvitations_Email" ON "UserInvitations"("Email");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserInvitations_Token" ON "UserInvitations"("Token");
CREATE INDEX IF NOT EXISTS "IX_UserInvitations_TokenIdx" ON "UserInvitations"("Token");
