"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
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
import { useHubFeed } from "@/hooks/useHubFeed";
import { useAuth } from "@/hooks/useAuth";
import { feedCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
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

    const {
        posts,
        errorMessage,
        loading,
        comments,
        openComments,
        commentDrafts,
        showParticles,
        setShowParticles,
        toggleReaction,
        votePoll,
        toggleComments,
        addComment,
        deleteComment,
        setCommentDraft,
        toggleCommentReaction,
        adminPin,
        adminDelete,
        refresh,
    } = useHubFeed();
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
            const message = getErrorMessage(error, "Nao foi possivel publicar no mural.");
            logFrontendError("HubFeedModule.createPost", error);
            toast.error(message);
            throw error;
        }
    };

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
                        <div className="space-y-3">
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

                            {posts.length === 0 ? (
                                <Empty className="editorial-shell rounded-[var(--radius-lg-token)] py-10">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <ScrollText className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle className="heading-3 text-[var(--bg-paper)]">
                                            {feedCopy.empty.title}
                                        </EmptyTitle>
                                        <EmptyDescription className="body-small text-[rgba(245,237,224,0.76)]">
                                            {feedCopy.empty.description}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : null}
                        </div>
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
