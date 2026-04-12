"use client";

import { useCallback, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";

import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import {
    Empty,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyHeader,
} from "@/components/ui/empty";
import { useHubFeed, type FeedSortOrder } from "@/hooks/useHubFeed";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useAuth } from "@/hooks/useAuth";
import { feedCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { cn } from "@/lib/utils";
import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { SectionBoundary } from "@/components/ui/section-boundary";

import { ErrorAlert } from "@/components/ui/error-alert";
import { HubPostCard } from "./HubPostCard";
import type { PostComposerSubmitData } from "./components/PostComposer";

const loadParticles = () =>
  import("@/components/animations/Particles").then((module) => ({
    default: module.Particles,
  }));

const loadPostComposer = () =>
  import("./components/PostComposer").then((module) => ({
    default: module.PostComposer,
  }));

const loadFeedInsightsPanel = () =>
  import("./components/FeedInsightsPanel").then((module) => ({
    default: module.FeedInsightsPanel,
  }));

const LazyParticles = dynamic(loadParticles, {
  loading: () => null,
  ssr: false,
});

const LazyPostComposer = dynamic(loadPostComposer, {
  loading: () => <ComposerFallback />,
  ssr: false,
});

const LazyFeedInsightsPanel = dynamic(loadFeedInsightsPanel, {
  loading: () => <FeedInsightsFallback />,
  ssr: false,
});

// ─── HubFeedModule ────────────────────────────────────────────────────────────

export function HubFeedModule({
    showComposer = true,
}: Readonly<{
    showComposer?: boolean;
}>) {
    const { data: session, status } = useSession();
    const { user } = useAuth();
    const isAdmin = useIsAdmin();
    const { event: activeEvent } = useEventOverview();
    const eventId = activeEvent?.id ?? null;

    const {
        posts,
        allPostsCount,
        errorMessage,
        loading,
        sort,
        setSort,
        hasMore,
        loadMore,
        comments,
        openComments,
        commentDrafts,
        showParticles,
        setShowParticles,
        toggleReaction,
        toggleDownvote,
        votePoll,
        toggleComments,
        addComment,
        deleteComment,
        setCommentDraft,
        toggleCommentReaction,
        adminPin,
        adminDelete,
        refresh,
    } = useHubFeed(eventId);
    const currentUserName =
        session?.user?.name?.trim() ||
        session?.user?.email?.trim() ||
        "Tu";
    const currentUserId = user?.id ?? null;
    const currentUserImage = session?.user?.image ?? null;

    useEffect(() => {
        if (status === "authenticated" && !session?.idToken) {
            void signOut({ redirect: false }).then(() => signIn("google"));
        }
    }, [session?.idToken, status]);

    useEffect(() => {
        if (!showComposer) return undefined;

        const timeoutId = window.setTimeout(() => {
            void loadPostComposer();
        }, 900);

        return () => window.clearTimeout(timeoutId);
    }, [showComposer]);

    const handleCreatePost = useCallback(async (data: PostComposerSubmitData) => {
        if (!eventId) {
            toast.error("Nao ha evento ativo para publicar no mural.");
            return;
        }

        const trimmedText = data.text.trim();
        if (!trimmedText) return;

        try {
            const { canhoesEventsRepo } = await import("@/lib/repositories/canhoesEventsRepo");
            let mediaUrls: string[] = [];
            if (data.files.length > 0) {
                mediaUrls = await canhoesEventsRepo.uploadFeedImages(eventId, data.files);
            }

            const pollQuestion = data.pollOn ? data.pollQuestion.trim() : "";
            const pollOptions = data.pollOn
                ? data.pollOptions.map((option) => option.trim()).filter(Boolean)
                : [];

            const createdPost = await canhoesEventsRepo.createFeedPost(eventId, {
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
            const message = getErrorMessage(error, "Nao foi possivel publicar no mural.");
            logFrontendError("HubFeedModule.createPost", error);
            toast.error(message);
            throw error;
        }
    }, [eventId]);

    return (
        <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5 xl:space-y-0">
            <SectionBoundary
                title="Erro no mural social"
                description="O mural social falhou ao renderizar, mas os indicadores laterais continuam disponiveis."
                onRetry={() => void refresh()}
            >
                <div className="space-y-3">
                    {!showComposer ? (
                        <CanhoesModuleHeader
                            icon={ScrollText}
                            title={feedCopy.hero.title}
                            description={feedCopy.hero.description}
                        />
                    ) : null}

                    {showComposer ? <LazyPostComposer onSubmit={handleCreatePost} /> : null}

                    {errorMessage ? (
                        <ErrorAlert
                            title="Erro ao carregar o mural"
                            description={errorMessage}
                            actionLabel="Tentar novamente"
                            onAction={() => void refresh()}
                        />
                    ) : null}

                    {loading ? <FeedSkeleton count={3} /> : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={sort}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                            {/* Sort bar */}
                            {!loading && posts.length > 0 && (
                                <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-3 py-2">
                                    <span className="text-xs font-medium text-[var(--text-muted)]">Ordenar:</span>
                                    {(["hot", "new", "top"] as FeedSortOrder[]).map((s) => (
                                        <motion.button
                                            key={s}
                                            type="button"
                                            onClick={() => setSort(s)}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "sort-pill rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                                sort === s ? "sort-pill-active" : ""
                                            )}
                                        >
                                            {s === "hot" ? "🔥 Popular" : s === "new" ? "🕐 Novo" : "⭐ Topo"}
                                        </motion.button>
                                    ))}
                                    {allPostsCount > 0 && (
                                        <span className="ml-auto text-[10px] text-[var(--text-muted)]">
                                            {allPostsCount} post{allPostsCount !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                            )}
                            {posts.map((post, index) => (
                                <HubPostCard
                                    key={post.id}
                                    post={post}
                                    index={index}
                                    isAdmin={isAdmin}
                                    openComments={openComments[post.id] ?? false}
                                    commentDraft={commentDrafts[post.id] ?? ""}
                                    comments={comments[post.id] ?? []}
                                    currentUserId={currentUserId}
                                    currentUserName={currentUserName}
                                    currentUserImage={currentUserImage}
                                    onToggleReaction={toggleReaction}
                                    onToggleDownvote={toggleDownvote}
                                    onToggleComments={toggleComments}
                                    onVotePoll={votePoll}
                                    onAddComment={addComment}
                                    onDeleteComment={deleteComment}
                                    onCommentDraftChange={setCommentDraft}
                                    onToggleCommentReaction={toggleCommentReaction}
                                    onAdminPin={adminPin}
                                    onAdminDelete={adminDelete}
                                />
                            ))}

                            {/* Load more button */}
                            {hasMore && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center py-4"
                                >
                                    <motion.button
                                        type="button"
                                        onClick={() => loadMore()}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-6 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-moss)] hover:bg-[var(--bg-surface)]"
                                    >
                                        Carregar mais ({allPostsCount - posts.length} restantes)
                                    </motion.button>
                                </motion.div>
                            )}

                            {posts.length === 0 ? (
                                <Empty className="editorial-shell rounded-[var(--radius-lg-token)] py-10">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <ScrollText className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle className="heading-3 text-[var(--text-primary)]">
                                            {feedCopy.empty.title}
                                        </EmptyTitle>
                                        <EmptyDescription className="body-small text-[var(--text-muted)]">
                                            {feedCopy.empty.description}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : null}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </SectionBoundary>

            <SectionBoundary
                title="Erro nos indicadores do mural"
                description="Os indicadores laterais falharam ao renderizar, mas o mural social continua disponivel."
            >
                <LazyFeedInsightsPanel posts={posts} />
            </SectionBoundary>

            {showParticles ? (
                <LazyParticles
                    count={24}
                    onComplete={() => setShowParticles(null)}
                    className="pointer-events-none fixed inset-0 z-50"
                />
            ) : null}
        </div>
    );
}

function ComposerFallback() {
    return (
        <div className="editorial-shell space-y-4 rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[rgba(74,92,47,0.18)] animate-pulse" />
                <div className="h-8 w-48 rounded bg-[rgba(74,92,47,0.12)] animate-pulse" />
            </div>
            <div className="h-32 rounded-[var(--radius-md-token)] bg-[rgba(18,24,11,0.72)] animate-pulse" />
            <div className="flex gap-2">
                <div className="h-10 w-24 rounded-full bg-[rgba(74,92,47,0.12)] animate-pulse" />
                <div className="h-10 w-24 rounded-full bg-[rgba(74,92,47,0.12)] animate-pulse" />
            </div>
        </div>
    );
}

function FeedInsightsFallback() {
    return (
        <aside className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="space-y-2">
                            <div className="h-3 w-20 rounded bg-[rgba(74,92,47,0.18)] animate-pulse" />
                            <div className="h-8 w-14 rounded bg-[rgba(74,92,47,0.12)] animate-pulse" />
                        </div>
                        <div className="h-11 w-11 rounded-full bg-[rgba(245,237,224,0.08)] animate-pulse" />
                    </div>
                    <div className="mt-3 h-3 w-4/5 rounded bg-[rgba(245,237,224,0.08)] animate-pulse" />
                </div>
            ))}
        </aside>
    );
}
