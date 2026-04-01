"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";

import { Particles } from "@/components/animations/Particles";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import {
    Empty,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyHeader,
} from "@/components/ui/empty";
import { useHubFeed } from "@/hooks/useHubFeed";
import { feedCopy } from "@/lib/canhoesCopy";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";

import { HubPostCard } from "./HubPostCard";
import { FeedInsightsPanel } from "./components/FeedInsightsPanel";
import {
    PostComposer,
    type PostComposerSubmitData,
} from "./components/PostComposer";

// ─── HubFeedModule ────────────────────────────────────────────────────────────

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
        openCommentComposer,
        showParticles,
        setShowParticles,
        toggleReaction,
        votePoll,
        toggleComments,
        addComment,
        setCommentDraft,
        openCommentInput,
        toggleCommentReaction,
        adminPin,
        adminDelete,
    } = useHubFeed();
    const currentUserName =
        session?.user?.name?.trim() ||
        session?.user?.email?.trim() ||
        "Tu";
    const currentUserImage = session?.user?.image ?? null;

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

    return (
        <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5 xl:space-y-0">
            <div className="space-y-3">
                {showComposer ? <PostComposer onSubmit={handleCreatePost} /> : null}

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
                                currentUserName={currentUserName}
                                currentUserImage={currentUserImage}
                                onToggleReaction={toggleReaction}
                                onToggleComments={toggleComments}
                                onVotePoll={votePoll}
                                onAddComment={addComment}
                                onCommentDraftChange={setCommentDraft}
                                showCommentComposer={openCommentComposer[post.id] ?? false}
                                onOpenCommentComposer={openCommentInput}
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
                                    <EmptyTitle className="heading-3 text-[var(--text-dark)]">
                                        {feedCopy.empty.title}
                                    </EmptyTitle>
                                    <EmptyDescription className="body-small text-[var(--text-muted)]">
                                        {feedCopy.empty.description}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : null}
                    </div>
                )}
            </div>

            <FeedInsightsPanel posts={posts} />

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
