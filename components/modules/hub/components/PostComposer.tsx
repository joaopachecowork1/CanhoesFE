"use client";

import { BarChart3, ImagePlus, Loader2, PlusCircle, ScrollText, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { feedCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";
import { MAX_MEDIA_FILES, MAX_POLL_OPTIONS, useComposer } from "@/hooks/useComposer";

export interface PostComposerSubmitData {
  text: string;
  files: File[];
  pollOn: boolean;
  pollQuestion: string;
  pollOptions: string[];
}

function buildPollOptionKey(options: string[], option: string, optionIndex: number): string {
  const normalizedOption = option.trim().toLowerCase() || "vazio";
  const duplicateCount = options.filter(
    (entry, index) => index <= optionIndex && entry === option
  ).length;

  return `poll-option-${normalizedOption}-${duplicateCount}`;
}

export function PostComposer({
  onSubmit,
}: Readonly<{
  onSubmit: (data: PostComposerSubmitData) => void | Promise<void>;
}>) {
  const {
    state: { text, files, previewUrls, isSubmitting, isPollEnabled, pollQuestion, pollOptions },
    actions: {
      setText,
      setIsSubmitting,
      setIsPollEnabled,
      setPollQuestion,
      handleFiles,
      removeFile,
      handlePollOptionChange,
      addPollOption,
      removePollOption,
      reset,
    },
    refs: { fileInputRef },
  } = useComposer();

  const handleSubmit = async () => {
    if (isSubmitting || !text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        files,
        pollOn: isPollEnabled,
        pollOptions,
        pollQuestion,
        text,
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollButtonActiveClassName = isPollEnabled
    ? "border-[rgba(177,140,255,0.26)] [box-shadow:var(--glow-purple-sm)]"
    : "";
  const mediaButtonActiveClassName = files.length > 0
    ? "border-[rgba(0,255,136,0.18)] shadow-[var(--glow-green-sm)]"
    : "";

  return (
    <section className="editorial-shell bg-circuit rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5 sm:py-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--neon-green)]">
              <ScrollText className="h-4 w-4" />
              <span className="editorial-kicker">{feedCopy.composer.kicker}</span>
            </div>
            <div className="space-y-1">
              <h3 className="heading-3 text-[var(--text-dark)]">
                {feedCopy.composer.title}
              </h3>
              <p className="body-small text-[var(--text-muted)]">
                {feedCopy.composer.description}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={files.length > 0 ? "secondary" : "outline"}
              size="sm"
              className={cn("gap-2 rounded-full px-4", mediaButtonActiveClassName)}
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <ImagePlus className="h-4 w-4" />
              {feedCopy.composer.mediaLabel}
              {files.length > 0 ? <span>{files.length}</span> : null}
            </Button>

            <Button
              type="button"
              variant={isPollEnabled ? "secondary" : "outline"}
              size="sm"
              className={cn("gap-2 rounded-full px-4", pollButtonActiveClassName)}
              onClick={() => setIsPollEnabled((currentValue) => !currentValue)}
              disabled={isSubmitting}
            >
              <BarChart3 className="h-4 w-4" />
              {feedCopy.composer.pollLabel}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="hub-post-text"
            className="editorial-kicker block text-[var(--color-text-muted)]"
          >
            {feedCopy.composer.textLabel}
          </label>
          <Textarea
            id="hub-post-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={feedCopy.composer.textPlaceholder}
            className="min-h-[132px] resize-none"
          />
        </div>

        {files.length > 0 ? (
          <div className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] p-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="editorial-kicker text-[rgba(245,237,224,0.62)]">
                  {feedCopy.composer.mediaSelected}
                </p>
                <p className="text-xs text-[rgba(245,237,224,0.62)]">
                  {files.length}/{MAX_MEDIA_FILES}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {files.map((file, fileIndex) => (
                  <div
                    key={`${file.name}-${file.size}-${fileIndex}`}
                    className="relative overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] shadow-[var(--shadow-panel)]"
                  >
                    <div className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrls[fileIndex]}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(fileIndex)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(212,184,150,0.16)] bg-[rgba(12,16,8,0.9)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)] transition-transform active:scale-95"
                      aria-label="Remover imagem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {isPollEnabled ? (
          <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] p-4 sm:p-5">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="editorial-kicker">{feedCopy.composer.pollLabel}</p>
                <h4 className="heading-3 text-[var(--text-dark)]">
                  {feedCopy.composer.pollTitle}
                </h4>
                <p className="body-small text-[var(--text-muted)]">
                  {feedCopy.composer.pollDescription}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hub-poll-question"
                  className="editorial-kicker text-[var(--color-text-muted)]"
                >
                  {feedCopy.composer.pollQuestionLabel}
                </label>
                <Textarea
                  id="hub-poll-question"
                  value={pollQuestion}
                  onChange={(event) => setPollQuestion(event.target.value)}
                  placeholder={feedCopy.composer.pollQuestionPlaceholder}
                  className="min-h-[88px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <p className="editorial-kicker text-[var(--color-text-muted)]">
                  {feedCopy.composer.pollOptionsLabel}
                </p>
                <div className="space-y-2">
                  {pollOptions.map((option, optionIndex) => (
                    <div
                      key={buildPollOptionKey(pollOptions, option, optionIndex)}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={option}
                        onChange={(event) =>
                          handlePollOptionChange(optionIndex, event.target.value)
                        }
                        placeholder={`${feedCopy.composer.pollOptionPlaceholder} ${optionIndex + 1}`}
                      />

                      {pollOptions.length > 2 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 text-[var(--color-danger)]"
                          onClick={() => removePollOption(optionIndex)}
                          aria-label={`Remover opcao ${optionIndex + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {pollOptions.length < MAX_POLL_OPTIONS ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 px-0 text-[var(--accent-purple-deep)] hover:text-[var(--accent-purple)]"
                    onClick={addPollOption}
                  >
                    <PlusCircle className="h-4 w-4" />
                    {feedCopy.composer.addOption}
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <div className="editorial-divider" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="body-small text-[var(--text-muted)]">
            {feedCopy.composer.helper}
          </p>

          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !text.trim()}
            className={cn(
              "w-full gap-2 sm:w-auto sm:min-w-[150px]",
              isSubmitting && "cursor-wait"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {feedCopy.composer.submit}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </section>
  );
}
