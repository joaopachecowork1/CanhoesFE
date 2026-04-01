"use client";

import { useEffect, type ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Camera, Pin, ScrollText, Vote } from "lucide-react";
import { toast } from "sonner";
import { cva, type VariantProps } from "class-variance-authority";

import { Particles } from "@/components/animations/Particles";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    PostComposer,
    type PostComposerSubmitData,
} from "./components/PostComposer";

// ─── CVA variant para o icon badge ───────────────────────────────────────────

const iconBadgeVariants = cva(
    "flex h-11 w-11 items-center justify-center rounded-full border shadow-[var(--shadow-card)]",
    {
        variants: {
            tone: {
                green:
                    "border-[rgba(0,255,136,0.18)] bg-[rgba(47,56,26,0.92)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)]",
                purple:
                    "border-[rgba(177,140,255,0.24)] bg-[linear-gradient(180deg,rgba(36,28,53,0.96),rgba(20,16,32,0.96))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]",
            },
        },
        defaultVariants: { tone: "green" },
    }
);

// ─── FeedInsightCard ──────────────────────────────────────────────────────────

function FeedInsightCard({
    label,
    value,
    description,
    icon,
    tone = "green",
}: Readonly<{
    label: string;
    value: number;
    description: string;
    icon: ReactNode;
    tone?: VariantProps<typeof iconBadgeVariants>["tone"];
}>) {
    return (
        <Card className="canhoes-paper-card rounded-[var(--radius-lg-token)] text-[var(--text-dark)]">
            <CardContent className="space-y-3 px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="editorial-kicker text-[var(--text-muted)]">{label}</p>
                        <p className="heading-2 text-[var(--text-dark)]">{value}</p>
                    </div>
                    <span className={iconBadgeVariants({ tone })}>{icon}</span>
                </div>
                <p className="body-small text-[var(--text-muted)]">{description}</p>
            </CardContent>
        </Card>
    );
}

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
        showParticles,
        setShowParticles,
        toggleReaction,
        votePoll,
        toggleComments,
        addComment,
        setCommentDraft,
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

    const getPostMediaCount = (post: {
        mediaUrl?: string | null;
        mediaUrls?: string[] | null;
    }) =>
        Array.from(
            new Set([...(post.mediaUrls ?? []), post.mediaUrl].filter(Boolean))
        ).length;

    const pinnedPostCount = posts.filter((post) => post.isPinned).length;
    const postsWithMediaCount = posts.filter(
        (post) => getPostMediaCount(post) > 0
    ).length;
    const postsWithPollCount = posts.filter((post) => Boolean(post.poll)).length;

    return (
        <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5 xl:space-y-0">
            <div className="space-y-4">
                {showComposer ? <PostComposer onSubmit={handleCreatePost} /> : null}

                {loading ? <FeedSkeleton count={3} /> : (
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
                                currentUserName={currentUserName}
                                currentUserImage={currentUserImage}
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
                    tone="purple"
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
