"use client";

import { useEffect, type ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Camera, Pin, RefreshCw, ScrollText, Vote } from "lucide-react";
import { toast } from "sonner";

import { Particles } from "@/components/animations/Particles";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { Button } from "@/components/ui/button";
import { useHubFeed } from "@/hooks/useHubFeed";
import { feedCopy } from "@/lib/canhoesCopy";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { cn } from "@/lib/utils";

import { HubPostCard } from "./HubPostCard";
import {
  PostComposer,
  type PostComposerSubmitData,
} from "./components/PostComposer";

function FeedInsightCard({
  label,
  value,
  description,
  icon,
}: Readonly<{
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
}>) {
  return (
    <section className="rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[linear-gradient(180deg,rgba(246,239,225,0.96),rgba(236,223,197,0.84))] px-4 py-4 text-[var(--text-dark)] shadow-[var(--shadow-paper)] sm:px-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--text-muted)]">{label}</p>
            <p className="heading-2 text-[var(--text-dark)]">{value}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-paper)] bg-[rgba(47,56,26,0.92)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)]">
            {icon}
          </span>
        </div>

        <p className="body-small text-[var(--text-muted)]">{description}</p>
      </div>
    </section>
  );
}

export function HubFeedModule({
  showComposer = true,
}: Readonly<{
  showComposer?: boolean;
}>) {
  const { data: session, status } = useSession();
  const isAdmin = useIsAdmin();

  const {
    posts,
    loading,
    comments,
    openComments,
    commentDrafts,
    showParticles,
    setShowParticles,
    refresh,
    toggleReaction,
    votePoll,
    toggleComments,
    addComment,
    setCommentDraft,
    toggleCommentReaction,
    adminPin,
    adminDelete,
  } = useHubFeed();

  useEffect(() => {
    if (status === "authenticated" && !session?.idToken) {
      void signOut({ redirect: false }).then(() => signIn("google"));
    }
  }, [session?.idToken, status]);

  const handleCreatePost = async (data: PostComposerSubmitData) => {
    const trimmedText = data.text.trim();
    if (!trimmedText) return;

    try {
      let mediaUrls: string[] = [];
      if (data.files.length > 0) {
        const { hubRepo } = await import("@/lib/repositories/hubRepo");
        mediaUrls = await hubRepo.uploadImages(data.files);
      }

      const { hubRepo } = await import("@/lib/repositories/hubRepo");
      const pollQuestion = data.pollOn ? data.pollQuestion.trim() : "";
      const pollOptions = data.pollOn
        ? data.pollOptions.map((option) => option.trim()).filter(Boolean)
        : [];

      const createdPost = await hubRepo.createPost({
        text: trimmedText,
        mediaUrls,
        pollQuestion: data.pollOn && pollQuestion ? pollQuestion : null,
        pollOptions: data.pollOn ? pollOptions : null,
      });

      if (createdPost?.id && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("hub:postCreated", { detail: createdPost })
        );
      }

      toast.success("Post publicado");
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel publicar");
      throw error;
    }
  };

  const getPostMediaCount = (post: { mediaUrl?: string | null; mediaUrls?: string[] | null }) =>
    Array.from(new Set([...(post.mediaUrls ?? []), post.mediaUrl].filter(Boolean))).length;

  const pinnedPostCount = posts.filter((post) => post.isPinned).length;
  const postsWithMediaCount = posts.filter((post) => getPostMediaCount(post) > 0).length;
  const postsWithPollCount = posts.filter((post) => Boolean(post.poll)).length;

  return (
    <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5 xl:space-y-0">
      <div className="space-y-4">
        <section className="page-hero px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--neon-green)]">
                <ScrollText className="h-4 w-4" />
                <span className="editorial-kicker">{feedCopy.hero.kicker}</span>
              </div>
              <div className="space-y-1">
                <h2 className="heading-2 text-[var(--text-primary)]">
                  {feedCopy.hero.title}
                </h2>
                <p className="type-subhead max-w-2xl text-[var(--beige)]/78">
                  {feedCopy.hero.description}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 self-start"
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {feedCopy.hero.refresh}
            </Button>
          </div>
        </section>

        {showComposer ? <PostComposer onSubmit={handleCreatePost} /> : null}

        {loading ? <FeedSkeleton count={3} /> : null}

        {!loading ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <HubPostCard
                key={post.id}
                post={post}
                index={index}
                isAdmin={isAdmin}
                openComments={openComments[post.id] ?? false}
                commentDraft={commentDrafts[post.id] ?? ""}
                comments={comments[post.id] ?? []}
                onToggleReaction={toggleReaction}
                onToggleComments={toggleComments}
                onVotePoll={votePoll}
                onAddComment={addComment}
                onCommentDraftChange={setCommentDraft}
                onToggleCommentReaction={toggleCommentReaction}
                onAdminPin={adminPin}
                onAdminDelete={adminDelete}
              />
            ))}

            {posts.length === 0 ? (
              <section className="editorial-shell rounded-[var(--radius-lg-token)] px-4 py-10 text-center sm:px-5">
                <p className="editorial-kicker">{feedCopy.empty.kicker}</p>
                <h3 className="heading-3 mt-2 text-[var(--text-dark)]">
                  {feedCopy.empty.title}
                </h3>
                <p className="body-small mt-2 text-[var(--text-muted)]">
                  {feedCopy.empty.description}
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <FeedInsightCard
          label={feedCopy.insights.archive.label}
          value={posts.length}
          description={feedCopy.insights.archive.description}
          icon={<ScrollText className="h-4 w-4" />}
        />
        <FeedInsightCard
          label={feedCopy.insights.media.label}
          value={postsWithMediaCount}
          description={feedCopy.insights.media.description}
          icon={<Camera className="h-4 w-4" />}
        />
        <FeedInsightCard
          label={feedCopy.insights.polls.label}
          value={postsWithPollCount}
          description={feedCopy.insights.polls.description}
          icon={<Vote className="h-4 w-4" />}
        />
        <FeedInsightCard
          label={feedCopy.insights.pinned.label}
          value={pinnedPostCount}
          description={feedCopy.insights.pinned.description}
          icon={<Pin className="h-4 w-4" />}
        />
      </aside>

      {showParticles ? (
        <Particles
          count={24}
          onComplete={() => setShowParticles(null)}
          className="pointer-events-none fixed inset-0 z-50"
        />
      ) : null}
    </div>
  );
}
