"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { BarChart3, ImagePlus, Leaf, Loader2, Send } from "lucide-react";

import { feedCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { hubRepo } from "@/lib/repositories/hubRepo";
import { cn } from "@/lib/utils";
import { MAX_MEDIA_FILES, MAX_POLL_OPTIONS, useComposer } from "@/hooks/useComposer";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const isAuthenticated = status === "authenticated";
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
  } = useComposer({
    onReset: () => {
      setUploadProgress(0);
      setUploadLabel("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  useEffect(() => {
    if (!open) {
      resetBase();
    }
  }, [open, resetBase]);

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

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadLabel("");

    try {
      let mediaUrls: string[] = [];

      if (files.length > 0) {
        setUploadLabel(composeCopy.uploading);
        const uploadedUrls: string[] = [];

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          const urls = await hubRepo.uploadImages([file]);
          const uploadedUrl = urls?.[0];

          if (!uploadedUrl) {
            throw new Error(`Falha ao enviar ${file.name}`);
          }

          uploadedUrls.push(uploadedUrl);
          setUploadProgress(Math.round(((index + 1) / files.length) * 100));
          setUploadLabel(`${composeCopy.uploading} ${index + 1}/${files.length}`);
        }

        mediaUrls = uploadedUrls;
      }

      const trimmedPollQuestion = isPollEnabled ? pollQuestion.trim() : "";
      const trimmedPollOptions = isPollEnabled
        ? pollOptions.map((option) => option.trim()).filter(Boolean)
        : [];

      const createdPost = await hubRepo.createPost({
        mediaUrls,
        pollOptions: isPollEnabled ? trimmedPollOptions : null,
        pollQuestion: isPollEnabled && trimmedPollQuestion ? trimmedPollQuestion : null,
        text: trimmedText,
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
        413: "As imagens escolhidas sao demasiado pesadas para publicar.",
      });
      logFrontendError("CanhoesComposeSheet.createPost", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-safe">
        <div className="flex justify-center pt-2">
          <span className="h-1.5 w-14 rounded-full bg-[rgba(245,237,224,0.24)]" />
        </div>
        <SheetHeader className="pb-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--color-text-primary)]">
              <Leaf className="h-4 w-4" />
            </span>

            <div className="space-y-1">
              <SheetTitle>{composeCopy.sheetTitle}</SheetTitle>
              <p className="body-small text-[var(--color-text-muted)]">
                {composeCopy.sheetDescription}
              </p>
            </div>
          </div>
        </SheetHeader>

        {isAuthenticated ? (
          <div className="space-y-4 px-4 pb-4">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={composeCopy.textPlaceholder}
              className="min-h-24 resize-none"
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
                      ? "border-[var(--color-moss)] bg-[var(--color-moss)] text-[var(--color-text-primary)] shadow-[var(--glow-green-sm)]"
                      : "border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.72)] text-[var(--bg-paper)]"
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
                      ? "border-[var(--color-brown)] bg-[var(--color-brown)] text-[var(--color-text-primary)] shadow-[var(--shadow-card)]"
                      : "border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.72)] text-[var(--bg-paper)]"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={() => void handleCreatePost()}
                disabled={isSubmitting || !text.trim()}
                className="min-w-[120px]"
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
            <p className="body-small text-[var(--color-text-muted)]">
              {composeCopy.authPrompt}
            </p>
            <Button onClick={() => signIn("google")} className="w-full">
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
