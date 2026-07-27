"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { BarChart3, ImagePlus, Leaf, Loader2, Send } from "lucide-react";

import { feedCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { feedRepo } from "@/lib/repositories/feedRepo";
import { cn } from "@/lib/utils";
import { MAX_MEDIA_FILES, MAX_POLL_OPTIONS, useComposer } from "@/components/modules/hub/hooks/useComposer";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { ComposeMediaGrid } from "./compose/ComposeMediaGrid";
import { ComposePollEditor } from "./compose/ComposePollEditor";
import { ComposeUploadProgress } from "./compose/ComposeUploadProgress";
import {
  isAcceptedImage,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
  normalizeUploadImage,
} from "./compose/composeUpload";

export function CanhoesComposeSheet({
  open,
  onOpenChange,
  onDone,
}: Readonly<{
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDone?: () => void;
}>) {
  const { status } = useSession();
  const { loginGoogle, loginDevelopment, isDevLoginAvailable } = useAuth();
  const isAuthenticated = status === "authenticated";
  const { event: activeEvent } = useEventOverview();
  const eventId = activeEvent?.id ?? null;
  const composeCopy = feedCopy.composer;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");

  const {
    state: { text, files, previewUrls, isSubmitting, isPollEnabled, pollQuestion, pollOptions },
    actions: {
      setText,
      setFiles,
      setIsSubmitting,
      setIsPollEnabled,
      setPollQuestion,
      removeFile,
      handlePollOptionChange,
      addPollOption,
      removePollOption,
      reset: resetBase,
    },
    refs: { fileInputRef },
  } = useComposer();

  useEffect(() => {
    if (!open) {
      resetBase();
      setUploadProgress(0);
      setUploadLabel("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [fileInputRef, open, resetBase]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const incomingFiles = Array.from(fileList);
    const nextFiles = [...files];
    const existingKeys = new Set(
      nextFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
    );
    let optimizedFileCount = 0;

    for (const incomingFile of incomingFiles) {
      const fileKey = `${incomingFile.name}-${incomingFile.size}-${incomingFile.lastModified}`;

      if (existingKeys.has(fileKey)) continue;
      if (!isAcceptedImage(incomingFile)) {
        toast.error(`${incomingFile.name}: ${composeCopy.unsupportedFormat}`);
        continue;
      }
      if (incomingFile.size > MAX_FILE_BYTES) {
        toast.error(
          `${incomingFile.name}: ${composeCopy.fileTooLargeLabel} ${MAX_FILE_MB}MB`
        );
        continue;
      }
      if (nextFiles.length >= MAX_MEDIA_FILES) {
        toast.error(`${composeCopy.maxImagesLabel} ${MAX_MEDIA_FILES}`);
        break;
      }

      const preparedFile = await normalizeUploadImage(incomingFile);
      if (preparedFile.size < incomingFile.size) optimizedFileCount++;

      nextFiles.push(preparedFile);
      existingKeys.add(fileKey);
    }

    setFiles(nextFiles);

    if (optimizedFileCount > 0) {
      toast.success(`${optimizedFileCount} ${composeCopy.optimizedLabel}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMoveFile = (index: number, direction: -1 | 1) => {
    setFiles((currentFiles) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentFiles.length) return currentFiles;

      const reorderedFiles = [...currentFiles];
      const [pickedFile] = reorderedFiles.splice(index, 1);
      reorderedFiles.splice(targetIndex, 0, pickedFile);
      return reorderedFiles;
    });
  };

  const handleCreatePost = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    if (!eventId) {
      toast.error("Não há evento ativo para publicar no mural.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadLabel("");

    try {
      let mediaUrls: string[] = [];

      if (files.length > 0) {
        setUploadLabel(composeCopy.uploading);
        setUploadProgress(0);

        const uploadedUrls = await feedRepo.uploadFeedImages(eventId, files);

        if (!uploadedUrls || uploadedUrls.length !== files.length) {
          throw new Error("Falha ao enviar as imagens");
        }

        setUploadProgress(100);
        mediaUrls = uploadedUrls;
      }

      const trimmedPollQuestion = isPollEnabled ? pollQuestion.trim() : "";
      const trimmedPollOptions = isPollEnabled
        ? pollOptions.map((option) => option.trim()).filter(Boolean)
        : [];

      const createdPost = await feedRepo.createPost(eventId, {
        text: trimmedText,
        mediaUrls,
        pollOptions: isPollEnabled ? trimmedPollOptions : null,
        pollQuestion: isPollEnabled && trimmedPollQuestion ? trimmedPollQuestion : null,
      });

      if (createdPost?.id && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hub:postCreated", { detail: createdPost }));
      }

      toast.success(composeCopy.published);
      resetBase();
      onDone?.();
      onOpenChange(false);
    } catch (error) {
      const message = getErrorMessage(error, composeCopy.publishError, {
        413: "As imagens escolhidas são demasiado pesadas para publicar.",
      });
      logFrontendError("CanhoesComposeSheet.createPost", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="relative overflow-hidden border-t border-white/10 bg-[rgba(10,14,8,0.75)] backdrop-blur-3xl pb-safe sm:max-w-2xl sm:mx-auto sm:mb-8 sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-[0_0_80px_-20px_rgba(79,99,54,0.3)]"
      >
        {/* React Bits inspired animated background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
          <div className="absolute -top-[20%] left-[20%] h-[300px] w-[300px] animate-pulse rounded-full bg-[var(--moss)]/15 blur-[100px]" style={{ animationDuration: '5s' }} />
          <div className="absolute -bottom-[20%] -right-[10%] h-[250px] w-[250px] animate-pulse rounded-full bg-[var(--accent-purple)]/15 blur-[80px]" style={{ animationDuration: '7s', animationDelay: '1s' }} />
        </div>

        <div className="flex justify-center pt-2 sm:hidden">
          <span className="h-1.5 w-14 rounded-full bg-white/20" />
        </div>
        <SheetHeader className="relative z-10 pb-3 sm:pt-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--ink-primary)]">
              <Leaf className="h-4 w-4" />
            </span>

            <div className="space-y-1">
              <SheetTitle>{composeCopy.sheetTitle}</SheetTitle>
              <SheetDescription className="body-small text-[var(--ink-secondary)]">
                {composeCopy.sheetDescription}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isAuthenticated ? (
          <div className="space-y-4 px-4 pb-4">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={composeCopy.textPlaceholder}
              className="relative z-10 min-h-[120px] resize-none border-white/10 bg-white/[0.02] text-base shadow-inner transition-all focus-visible:border-[var(--moss)] focus-visible:bg-white/[0.04] focus-visible:shadow-[0_0_0_1px_var(--moss)] sm:min-h-[140px] sm:text-sm"
              autoFocus
            />

            <ComposeMediaGrid
              files={files}
              maxFiles={MAX_MEDIA_FILES}
              previewUrls={previewUrls}
              onMove={handleMoveFile}
              onRemove={removeFile}
            />

            {isSubmitting && files.length > 0 ? (
              <ComposeUploadProgress
                label={uploadLabel || composeCopy.uploadingFallback}
                progress={uploadProgress}
              />
            ) : null}

            {isPollEnabled ? (
              <ComposePollEditor
                disabled={isSubmitting}
                maxOptions={MAX_POLL_OPTIONS}
                onAddOption={addPollOption}
                onOptionChange={handlePollOptionChange}
                onQuestionChange={setPollQuestion}
                onRemoveOption={removePollOption}
                options={pollOptions}
                question={pollQuestion}
              />
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={composeCopy.mediaLabel}
                  disabled={isSubmitting || files.length >= MAX_MEDIA_FILES}
                  className={cn(
                    "canhoes-tap relative flex h-11 w-11 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50",
                    files.length > 0
                      ? "border-[var(--moss)] bg-[var(--moss)] text-[var(--ink-primary)] shadow-[var(--glow-green-sm)]"
                      : "border-[rgba(255,255,255,0.18)] bg-[rgba(18,23,12,0.72)] text-[var(--ink-primary)]"
                  )}
                >
                  <ImagePlus className="h-4 w-4" />
                  {files.length > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-fire)] text-[9px] font-bold text-white">
                      {files.length}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => setIsPollEnabled((currentValue) => !currentValue)}
                  title={composeCopy.pollLabel}
                  disabled={isSubmitting}
                  className={cn(
                    "canhoes-tap flex h-11 w-11 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50",
                    isPollEnabled
                      ? "border-[var(--color-brown)] bg-[var(--color-brown)] text-[var(--ink-primary)] shadow-[var(--shadow-card)]"
                      : "border-[rgba(255,255,255,0.18)] bg-[rgba(18,23,12,0.72)] text-[var(--ink-primary)]"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={() => void handleCreatePost()}
                disabled={isSubmitting || !text.trim()}
                className="relative z-10 min-w-[120px] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_var(--moss)] active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {composeCopy.submit}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 px-4 pb-4">
            <p className="body-small text-[var(--ink-secondary)]">
              {composeCopy.authPrompt}
            </p>
            <Button
              onClick={isDevLoginAvailable ? loginDevelopment : loginGoogle}
              className="w-full"
            >
              {composeCopy.signIn}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </SheetContent>
    </Sheet>
  );
}
