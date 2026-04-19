"use client";

import React from "react";

import type { HubPollDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function PollBox({
  poll,
  onVote,
}: Readonly<{
  poll: HubPollDto;
  onVote: (optionId: string) => void;
}>) {
  const totalVotes = Math.max(0, poll.totalVotes || 0);

  return (
    <section className="surface-panel p-4 sm:p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="editorial-kicker">Sondagem</p>
          <h3 className="heading-3 text-[var(--color-text-primary)]">
            {poll.question}
          </h3>
        </div>

        <div className="space-y-3">
          {poll.options.map((option) => {
            const isActive = poll.myOptionId === option.id;
            const percentage =
              totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onVote(option.id)}
                aria-pressed={isActive}
                aria-label={`${option.text} — ${option.voteCount} votos, ${percentage}%`}
                className={cn(
                  "relative w-full overflow-hidden rounded-[var(--radius-md-token)] border px-4 py-3 text-left motion-safe-smooth",
                  isActive
                    ? "border-[var(--border-moss)]/35 bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-deep)] hover:border-[var(--border-moss)]/30"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-[var(--radius-md-token)]",
                    isActive
                      ? "bg-[var(--moss)]/18"
                      : "bg-[var(--bark)]/10"
                  )}
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${option.text}: ${percentage}%`}
                />

                <span className="relative flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {option.text}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {option.voteCount} · {percentage}%
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="body-small text-[var(--color-text-muted)]">
          {totalVotes} voto(s) registados. Podes trocar o teu voto enquanto a
          sondagem estiver ativa.
        </p>
      </div>
    </section>
  );
}
