"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { ScrollText } from "lucide-react";

import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { useHubFeed } from "@/hooks/useHubFeed";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useAuth } from "@/hooks/useAuth";
import { feedCopy } from "@/lib/canhoesCopy";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { SectionBoundary } from "@/components/ui/section-boundary";

import { CanhoesDecorativeDivider, CanhoesGlowBackdrop } from "@/components/ui/canhoes-bits";
import { ErrorAlert } from "@/components/ui/error-alert";
import { HubFeedList } from "./HubFeedList";
import { useCreateFeedPost } from "./useCreateFeedPost";
import { useFeedInfiniteScroll } from "./useFeedInfiniteScroll";

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
        isFetchingNextPage,
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

    const sentinelRef = useFeedInfiniteScroll({
        enabled: hasMore,
        isFetchingNextPage,
        onLoadMore: loadMore,
    });
    const currentUserName =
        session?.user?.name?.trim() ||
        session?.user?.email?.trim() ||
        "Tu";
    const handleCreatePost = useCreateFeedPost({ eventId });
    const currentUserId = user?.id ?? null;
    const currentUserImage = session?.user?.image ?? null;

    useEffect(() => {
        if (status === "authenticated" && !session?.idToken) {
            void signOut({ redirect: false }).then(() => signIn("google"));
        }
    }, [session?.idToken, status]);

    return (
        <div className="zone-feed space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5 xl:space-y-0">
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
                            tone="social"
                            onAction={() => void refresh()}
                        />
                    ) : null}

                    {loading ? <FeedSkeleton count={3} /> : (
                        <HubFeedList
                            posts={posts}
                            sort={sort}
                            allPostsCount={allPostsCount}
                            isAdmin={isAdmin}
                            hasMore={hasMore}
                            isFetchingNextPage={isFetchingNextPage}
                            currentUserId={currentUserId}
                            currentUserImage={currentUserImage}
                            currentUserName={currentUserName}
                            comments={comments}
                            openComments={openComments}
                            commentDrafts={commentDrafts}
                            onSortChange={setSort}
                            onLoadMore={loadMore}
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
                            sentinelRef={sentinelRef}
                        />
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
        <div className="canhoes-bits-panel canhoes-bits-panel--social editorial-shell space-y-4 rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5 sm:py-5">
            <CanhoesGlowBackdrop tone="social" />
            <div className="space-y-2">
                <div className="skeleton-shimmer h-3 w-24 rounded" />
                <div className="skeleton-shimmer h-8 w-48 rounded" />
            </div>
            <CanhoesDecorativeDivider tone="purple" />
            <div className="skeleton-shimmer h-32 rounded-[var(--radius-md-token)]" />
            <div className="flex gap-2">
                <div className="skeleton-shimmer h-10 w-24 rounded-full" />
                <div className="skeleton-shimmer h-10 w-24 rounded-full" />
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
                    className="canhoes-bits-panel canhoes-bits-panel--social rounded-[var(--radius-lg-token)] border px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5"
                >
                    <CanhoesGlowBackdrop tone="social" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="space-y-2">
                            <div className="skeleton-shimmer h-3 w-20 rounded" />
                            <div className="skeleton-shimmer h-8 w-14 rounded" />
                        </div>
                        <div className="skeleton-shimmer h-11 w-11 rounded-full" />
                    </div>
                    <div className="skeleton-shimmer mt-3 h-3 w-4/5 rounded" />
                </div>
            ))}
        </aside>
    );
}
