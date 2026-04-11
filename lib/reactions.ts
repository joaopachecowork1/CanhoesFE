/**
 * Centralized reaction definitions for the feed.
 *
 * All feed reactions are defined here so that:
 * - HubPostActions, ReactionBar, and HubPostComments use the same source
 * - Adding/removing reactions only requires editing this file
 * - The backend can later replace this with a dynamic config endpoint
 */

export type FeedReaction = {
  emoji: string;
  key: string;
  label: string;
};

export const HUB_REACTIONS: readonly FeedReaction[] = [
  { emoji: "❤️", key: "heart", label: "Amo" },
  { emoji: "🔥", key: "fire", label: "Fogo" },
  { emoji: "😂", key: "laugh", label: "Riso" },
  { emoji: "👏", key: "clap", label: "Aplauso" },
  { emoji: "😮", key: "wow", label: "Surpresa" },
  { emoji: "😢", key: "sad", label: "Triste" },
  { emoji: "👍", key: "thumbsup", label: "Fixe" },
] as const;

/**
 * The primary "like" reaction — used for double-tap, upvote fallback, etc.
 */
export const HEART_REACTION = "❤️";

/**
 * Quick-reaction emojis that appear as direct buttons in the post action bar.
 * The rest are accessible through the reaction picker popover.
 */
export const QUICK_REACTIONS = HUB_REACTIONS.slice(0, 3) as readonly FeedReaction[];

/**
 * All emoji strings (for type safety in components that just need the string).
 */
export const HUB_EMOJI_STRINGS = HUB_REACTIONS.map((r) => r.emoji) as readonly string[];

/**
 * Look up a reaction by emoji.
 */
export function getReactionByEmoji(emoji: string): FeedReaction | undefined {
  return HUB_REACTIONS.find((r) => r.emoji === emoji);
}

/**
 * Look up a reaction by key.
 */
export function getReactionByKey(key: string): FeedReaction | undefined {
  return HUB_REACTIONS.find((r) => r.key === key);
}
