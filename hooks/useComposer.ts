"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const MAX_MEDIA_FILES = 10;
export const MAX_POLL_OPTIONS = 6;

export interface ComposerState {
  text: string;
  files: File[];
  previewUrls: string[];
  isPollEnabled: boolean;
  pollQuestion: string;
  pollOptions: string[];
  isSubmitting: boolean;
}

export interface UseComposerOptions {
  /** Called when the sheet/modal closes to clean up side effects */
  onReset?: () => void;
}

export function useComposer({ onReset }: UseComposerOptions = {}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlCacheRef = useRef<string[]>([]);

  const previewUrls = useMemo(() => {
    const nextUrls: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const cachedUrl = previewUrlCacheRef.current[index];

      if (cachedUrl) {
        nextUrls.push(cachedUrl);
        continue;
      }

      nextUrls.push(URL.createObjectURL(file));
    }

    return nextUrls;
  }, [files]);

  useEffect(() => {
    const previousUrls = previewUrlCacheRef.current;
    const nextUrls = previewUrls;

    previousUrls.forEach((url, index) => {
      if (nextUrls[index] !== url) {
        URL.revokeObjectURL(url);
      }
    });

    previewUrlCacheRef.current = nextUrls;

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const reset = useCallback(() => {
    setText("");
    setFiles([]);
    setIsPollEnabled(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    onReset?.();
  }, [onReset]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    setFiles((currentFiles) =>
      [...currentFiles, ...Array.from(fileList)].slice(0, MAX_MEDIA_FILES)
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((currentFiles) =>
      currentFiles.filter((_, currentIndex) => currentIndex !== index)
    );
  }, []);

  const handlePollOptionChange = useCallback((index: number, value: string) => {
    setPollOptions((currentOptions) =>
      currentOptions.map((option, currentIndex) => (currentIndex === index ? value : option))
    );
  }, []);

  const addPollOption = useCallback(() => {
    setPollOptions((currentOptions) =>
      currentOptions.length < MAX_POLL_OPTIONS ? [...currentOptions, ""] : currentOptions
    );
  }, []);

  const removePollOption = useCallback((index: number) => {
    setPollOptions((currentOptions) =>
      currentOptions.length > 2
        ? currentOptions.filter((_, currentIndex) => currentIndex !== index)
        : currentOptions
    );
  }, []);

  return {
    state: {
      text,
      files,
      previewUrls,
      isSubmitting,
      isPollEnabled,
      pollQuestion,
      pollOptions,
    },
    actions: {
      setText,
      setFiles,
      setIsSubmitting,
      setIsPollEnabled,
      setPollQuestion,
      setPollOptions,
      handleFiles,
      removeFile,
      handlePollOptionChange,
      addPollOption,
      removePollOption,
      reset,
    },
    refs: {
      fileInputRef,
    },
  };
}
