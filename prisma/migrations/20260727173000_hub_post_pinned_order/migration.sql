ALTER TABLE "HubPosts" ADD COLUMN "PinnedOrder" integer;

WITH ranked AS (
  SELECT "Id", ROW_NUMBER() OVER (
    PARTITION BY "EventId"
    ORDER BY "CreatedAtUtc" ASC, "Id" ASC
  ) - 1 AS position
  FROM "HubPosts"
  WHERE "IsPinned" = TRUE
)
UPDATE "HubPosts" AS posts
SET "PinnedOrder" = ranked.position
FROM ranked
WHERE posts."Id" = ranked."Id";

CREATE INDEX "IX_HubPosts_EventId_IsPinned_PinnedOrder"
ON "HubPosts"("EventId", "IsPinned", "PinnedOrder");
