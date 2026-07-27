-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Users" (
    "Id" UUID NOT NULL,
    "ExternalId" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "DisplayName" TEXT,
    "IsAdmin" BOOLEAN NOT NULL,
    "CreatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Events" (
    "Id" VARCHAR(64) NOT NULL,
    "Name" VARCHAR(128) NOT NULL,
    "IsActive" BOOLEAN NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_Events" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EventMembers" (
    "Id" VARCHAR(64) NOT NULL,
    "EventId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "Role" VARCHAR(16) NOT NULL,
    "JoinedAtUtc" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PK_EventMembers" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EventPhases" (
    "Id" VARCHAR(64) NOT NULL,
    "EventId" VARCHAR(64) NOT NULL,
    "Type" VARCHAR(32) NOT NULL,
    "StartDateUtc" TIMESTAMPTZ(6) NOT NULL,
    "EndDateUtc" TIMESTAMPTZ(6) NOT NULL,
    "IsActive" BOOLEAN NOT NULL,

    CONSTRAINT "PK_EventPhases" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AwardCategories" (
    "Id" TEXT NOT NULL,
    "EventId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "VoteQuestion" TEXT,
    "VoteRules" JSONB,
    "SortOrder" INTEGER NOT NULL,
    "Kind" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL,

    CONSTRAINT "PK_AwardCategories" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Nominees" (
    "Id" TEXT NOT NULL,
    "EventId" TEXT NOT NULL,
    "CategoryId" TEXT,
    "Title" TEXT NOT NULL,
    "SubmissionKind" TEXT NOT NULL,
    "ImageUrl" TEXT,
    "SubmittedByUserId" UUID NOT NULL,
    "Status" TEXT NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_Nominees" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CategoryProposals" (
    "Id" TEXT NOT NULL,
    "EventId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "ProposedByUserId" UUID NOT NULL,
    "Status" TEXT NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_CategoryProposals" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Measures" (
    "Id" TEXT NOT NULL,
    "EventId" TEXT NOT NULL,
    "Text" TEXT NOT NULL,
    "IsActive" BOOLEAN NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_Measures" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MeasureProposals" (
    "Id" TEXT NOT NULL,
    "EventId" TEXT NOT NULL,
    "Text" TEXT NOT NULL,
    "ProposedByUserId" UUID NOT NULL,
    "Status" TEXT NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_MeasureProposals" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Votes" (
    "Id" TEXT NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "NomineeId" TEXT NOT NULL,
    "UserId" UUID NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EventId" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PK_Votes" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserVotes" (
    "Id" TEXT NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "VoterUserId" UUID NOT NULL,
    "TargetUserId" UUID NOT NULL,
    "UpdatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EventId" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PK_UserVotes" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WishlistItems" (
    "Id" TEXT NOT NULL,
    "EventId" TEXT NOT NULL,
    "UserId" UUID NOT NULL,
    "Title" TEXT NOT NULL,
    "Url" TEXT,
    "Notes" TEXT,
    "ImageUrl" TEXT,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_WishlistItems" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "SecretSantaDraws" (
    "Id" TEXT NOT NULL,
    "EventCode" TEXT NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUserId" UUID NOT NULL,
    "IsLocked" BOOLEAN NOT NULL,

    CONSTRAINT "PK_SecretSantaDraws" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "SecretSantaAssignments" (
    "Id" TEXT NOT NULL,
    "DrawId" TEXT NOT NULL,
    "GiverUserId" UUID NOT NULL,
    "ReceiverUserId" UUID NOT NULL,

    CONSTRAINT "PK_SecretSantaAssignments" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CanhoesEventState" (
    "Id" SERIAL NOT NULL,
    "EventId" TEXT NOT NULL,
    "Phase" TEXT NOT NULL,
    "NominationsVisible" BOOLEAN NOT NULL,
    "ResultsVisible" BOOLEAN NOT NULL,
    "ModuleVisibilityJson" JSONB NOT NULL DEFAULT '{}',
    "HasSecretSantaDraw" BOOLEAN NOT NULL DEFAULT false,
    "SecretSantaEventCode" TEXT,

    CONSTRAINT "PK_CanhoesEventState" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPosts" (
    "Id" VARCHAR(64) NOT NULL,
    "EventId" VARCHAR(64) NOT NULL,
    "AuthorUserId" UUID NOT NULL,
    "Text" VARCHAR(4000) NOT NULL,
    "MediaUrl" VARCHAR(1024),
    "MediaUrlsJson" JSONB NOT NULL DEFAULT '[]',
    "IsPinned" BOOLEAN NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPosts" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostDownvotes" (
    "Id" VARCHAR(64) NOT NULL,
    "PostId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostDownvotes" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostComments" (
    "Id" VARCHAR(64) NOT NULL,
    "PostId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "Text" VARCHAR(2000) NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostComments" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostReactions" (
    "Id" VARCHAR(64) NOT NULL,
    "PostId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "Emoji" VARCHAR(16) NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostReactions" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostCommentReactions" (
    "Id" VARCHAR(64) NOT NULL,
    "CommentId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "Emoji" VARCHAR(16) NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostCommentReactions" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostPolls" (
    "PostId" VARCHAR(64) NOT NULL,
    "Question" VARCHAR(512) NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostPolls" PRIMARY KEY ("PostId")
);

-- CreateTable
CREATE TABLE "HubPostPollOptions" (
    "Id" TEXT NOT NULL,
    "PostId" VARCHAR(64) NOT NULL,
    "Text" VARCHAR(256) NOT NULL,
    "SortOrder" INTEGER NOT NULL,

    CONSTRAINT "PK_HubPostPollOptions" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostPollVotes" (
    "Id" TEXT NOT NULL,
    "PostId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "OptionId" TEXT NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostPollVotes" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostMedia" (
    "Id" VARCHAR(64) NOT NULL,
    "PostId" VARCHAR(64),
    "Url" VARCHAR(1024) NOT NULL,
    "OriginalFileName" VARCHAR(260) NOT NULL,
    "FileSizeBytes" BIGINT NOT NULL,
    "UploadedByUserId" UUID,
    "ContentType" VARCHAR(128),
    "UploadedAtUtc" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PK_HubPostMedia" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HubPostLikes" (
    "Id" VARCHAR(64) NOT NULL,
    "PostId" VARCHAR(64) NOT NULL,
    "UserId" UUID NOT NULL,
    "CreatedAtUtc" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_HubPostLikes" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IX_Users_ExternalId" ON "Users"("ExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_Users_Email" ON "Users"("Email");

-- CreateIndex
CREATE INDEX "IX_Users_IsAdmin" ON "Users"("IsAdmin");

-- CreateIndex
CREATE INDEX "IX_Events_IsActive" ON "Events"("IsActive");

-- CreateIndex
CREATE INDEX "IX_EventMembers_EventId_Role" ON "EventMembers"("EventId", "Role");

-- CreateIndex
CREATE UNIQUE INDEX "IX_EventMembers_EventId_UserId" ON "EventMembers"("EventId", "UserId");

-- CreateIndex
CREATE INDEX "IX_EventPhases_EventId_IsActive" ON "EventPhases"("EventId", "IsActive");

-- CreateIndex
CREATE INDEX "IX_EventPhases_EventId_StartDateUtc" ON "EventPhases"("EventId", "StartDateUtc");

-- CreateIndex
CREATE UNIQUE INDEX "IX_EventPhases_EventId_Type" ON "EventPhases"("EventId", "Type");

-- CreateIndex
CREATE INDEX "IX_AwardCategories_EventId_IsActive" ON "AwardCategories"("EventId", "IsActive");

-- CreateIndex
CREATE INDEX "IX_AwardCategories_EventId_SortOrder" ON "AwardCategories"("EventId", "SortOrder");

-- CreateIndex
CREATE INDEX "IX_AwardCategories_IsActive" ON "AwardCategories"("IsActive");

-- CreateIndex
CREATE INDEX "IX_Nominees_CategoryId_Status" ON "Nominees"("CategoryId", "Status");

-- CreateIndex
CREATE INDEX "IX_Nominees_EventId_Status" ON "Nominees"("EventId", "Status");

-- CreateIndex
CREATE INDEX "IX_Nominees_EventId_Status_CategoryId" ON "Nominees"("EventId", "Status", "CategoryId");

-- CreateIndex
CREATE INDEX "IX_Nominees_SubmittedByUserId" ON "Nominees"("SubmittedByUserId");

-- CreateIndex
CREATE INDEX "IX_CategoryProposals_EventId_Status_CreatedAtUtc" ON "CategoryProposals"("EventId", "Status", "CreatedAtUtc");

-- CreateIndex
CREATE INDEX "IX_CategoryProposals_ProposedByUserId" ON "CategoryProposals"("ProposedByUserId");

-- CreateIndex
CREATE INDEX "IX_CategoryProposals_Status" ON "CategoryProposals"("Status");

-- CreateIndex
CREATE INDEX "IX_Measures_EventId_IsActive" ON "Measures"("EventId", "IsActive");

-- CreateIndex
CREATE INDEX "IX_MeasureProposals_EventId_Status_CreatedAtUtc" ON "MeasureProposals"("EventId", "Status", "CreatedAtUtc");

-- CreateIndex
CREATE INDEX "IX_MeasureProposals_ProposedByUserId" ON "MeasureProposals"("ProposedByUserId");

-- CreateIndex
CREATE INDEX "IX_MeasureProposals_Status" ON "MeasureProposals"("Status");

-- CreateIndex
CREATE INDEX "IX_Votes_EventId_UserId" ON "Votes"("EventId", "UserId");

-- CreateIndex
CREATE INDEX "IX_Votes_NomineeId" ON "Votes"("NomineeId");

-- CreateIndex
CREATE INDEX "IX_Votes_UserId" ON "Votes"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_Votes_CategoryId_UserId" ON "Votes"("CategoryId", "UserId");

-- CreateIndex
CREATE INDEX "IX_UserVotes_EventId_CategoryId_VoterUserId" ON "UserVotes"("EventId", "CategoryId", "VoterUserId");

-- CreateIndex
CREATE INDEX "IX_UserVotes_EventId_VoterUserId" ON "UserVotes"("EventId", "VoterUserId");

-- CreateIndex
CREATE INDEX "IX_UserVotes_TargetUserId" ON "UserVotes"("TargetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_UserVotes_CategoryId_VoterUserId" ON "UserVotes"("CategoryId", "VoterUserId");

-- CreateIndex
CREATE INDEX "IX_WishlistItems_EventId" ON "WishlistItems"("EventId");

-- CreateIndex
CREATE INDEX "IX_WishlistItems_UserId" ON "WishlistItems"("UserId");

-- CreateIndex
CREATE INDEX "IX_SecretSantaDraws_EventCode" ON "SecretSantaDraws"("EventCode");

-- CreateIndex
CREATE INDEX "IX_SecretSantaAssignments_DrawId" ON "SecretSantaAssignments"("DrawId");

-- CreateIndex
CREATE INDEX "IX_SecretSantaAssignments_GiverUserId" ON "SecretSantaAssignments"("GiverUserId");

-- CreateIndex
CREATE INDEX "IX_SecretSantaAssignments_ReceiverUserId" ON "SecretSantaAssignments"("ReceiverUserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_CanhoesEventState_EventId" ON "CanhoesEventState"("EventId");

-- CreateIndex
CREATE INDEX "IX_HubPosts_AuthorUserId" ON "HubPosts"("AuthorUserId");

-- CreateIndex
CREATE INDEX "IX_HubPosts_CreatedAtUtc" ON "HubPosts"("CreatedAtUtc");

-- CreateIndex
CREATE INDEX "IX_HubPosts_EventId_IsPinned_CreatedAtUtc" ON "HubPosts"("EventId", "IsPinned", "CreatedAtUtc");

-- CreateIndex
CREATE INDEX "IX_HubPosts_IsPinned" ON "HubPosts"("IsPinned");

-- CreateIndex
CREATE INDEX "IX_HubPostDownvotes_PostId" ON "HubPostDownvotes"("PostId");

-- CreateIndex
CREATE INDEX "IX_HubPostDownvotes_UserId" ON "HubPostDownvotes"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_HubPostDownvotes_PostId_UserId" ON "HubPostDownvotes"("PostId", "UserId");

-- CreateIndex
CREATE INDEX "IX_HubPostComments_PostId" ON "HubPostComments"("PostId");

-- CreateIndex
CREATE INDEX "IX_HubPostComments_PostId_CreatedAtUtc" ON "HubPostComments"("PostId", "CreatedAtUtc");

-- CreateIndex
CREATE INDEX "IX_HubPostComments_UserId" ON "HubPostComments"("UserId");

-- CreateIndex
CREATE INDEX "IX_HubPostReactions_PostId" ON "HubPostReactions"("PostId");

-- CreateIndex
CREATE INDEX "IX_HubPostReactions_UserId" ON "HubPostReactions"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_HubPostReactions_PostId_UserId_Emoji" ON "HubPostReactions"("PostId", "UserId", "Emoji");

-- CreateIndex
CREATE INDEX "IX_HubPostCommentReactions_CommentId" ON "HubPostCommentReactions"("CommentId");

-- CreateIndex
CREATE INDEX "IX_HubPostCommentReactions_UserId" ON "HubPostCommentReactions"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_HubPostCommentReactions_CommentId_UserId_Emoji" ON "HubPostCommentReactions"("CommentId", "UserId", "Emoji");

-- CreateIndex
CREATE INDEX "IX_HubPostPollOptions_PostId_SortOrder" ON "HubPostPollOptions"("PostId", "SortOrder");

-- CreateIndex
CREATE INDEX "IX_HubPostPollVotes_UserId" ON "HubPostPollVotes"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_HubPostPollVotes_PostId_UserId" ON "HubPostPollVotes"("PostId", "UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_HubPostMedia_Url" ON "HubPostMedia"("Url");

-- CreateIndex
CREATE INDEX "IX_HubPostMedia_PostId" ON "HubPostMedia"("PostId");

-- CreateIndex
CREATE INDEX "IX_HubPostMedia_UploadedAtUtc" ON "HubPostMedia"("UploadedAtUtc");

-- CreateIndex
CREATE INDEX "IX_HubPostMedia_UploadedByUserId" ON "HubPostMedia"("UploadedByUserId");

-- CreateIndex
CREATE INDEX "IX_HubPostLikes_PostId" ON "HubPostLikes"("PostId");

-- CreateIndex
CREATE INDEX "IX_HubPostLikes_UserId" ON "HubPostLikes"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "IX_HubPostLikes_PostId_UserId" ON "HubPostLikes"("PostId", "UserId");

-- AddForeignKey
ALTER TABLE "HubPostDownvotes" ADD CONSTRAINT "HubPostDownvotes_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPosts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostComments" ADD CONSTRAINT "HubPostComments_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPosts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostReactions" ADD CONSTRAINT "HubPostReactions_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPosts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostCommentReactions" ADD CONSTRAINT "HubPostCommentReactions_CommentId_fkey" FOREIGN KEY ("CommentId") REFERENCES "HubPostComments"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostPolls" ADD CONSTRAINT "HubPostPolls_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPosts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostPollOptions" ADD CONSTRAINT "HubPostPollOptions_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPostPolls"("PostId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostPollVotes" ADD CONSTRAINT "HubPostPollVotes_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPostPolls"("PostId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostMedia" ADD CONSTRAINT "HubPostMedia_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPosts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubPostLikes" ADD CONSTRAINT "HubPostLikes_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "HubPosts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
