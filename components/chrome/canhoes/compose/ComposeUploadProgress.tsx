"use client";

import { Progress } from "@/components/ui/progress";

export function ComposeUploadProgress({
  label,
  progress,
}: Readonly<{
  label: string;
  progress: number;
}>) {
  return (
    <div className="space-y-2 rounded-2xl border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface-alt)] p-3">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)]">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5 bg-[rgba(61,43,24,0.16)]" />
    </div>
  );
}
