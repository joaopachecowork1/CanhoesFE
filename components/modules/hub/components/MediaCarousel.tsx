"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { feedCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";

import { absMediaUrl } from "./hubUtils";

function useCarouselGesture(totalSlides: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (event: TouchEvent) => {
    const deltaX = Math.abs(event.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(event.touches[0].clientY - touchStartY.current);

    if (deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (!isDragging.current) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;

    if (deltaX < -threshold && currentIndex < totalSlides - 1) {
      setCurrentIndex((previousIndex) => previousIndex + 1);
    } else if (deltaX > threshold && currentIndex > 0) {
      setCurrentIndex((previousIndex) => previousIndex - 1);
    }

    isDragging.current = false;
  };

  return {
    currentIndex,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    setCurrentIndex,
  };
}

export function MediaCarousel({
  urls,
  className,
  aspect = "square",
}: Readonly<{
  urls: string[];
  className?: string;
  aspect?: "square" | "portrait" | "video";
}>) {
  const media = useMemo(() => (urls ?? []).filter(Boolean), [urls]);
  const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const { currentIndex, setCurrentIndex, handleTouchEnd, handleTouchMove, handleTouchStart } =
    useCarouselGesture(media.length);

  useEffect(() => {
    setCurrentIndex((previousIndex) =>
      Math.min(previousIndex, Math.max(media.length - 1, 0))
    );
  }, [media.length, setCurrentIndex]);

  if (media.length === 0) return null;

  const compactHeightClassName = aspect === "portrait" ? "max-h-80" : "max-h-64";
  const frameHeightClassName = isImageExpanded ? "max-h-[80vh]" : compactHeightClassName;
  const imageClassName = isImageExpanded
    ? "max-h-[80vh] w-full object-contain"
    : "h-64 w-full object-cover";
  const navButtonClassName =
    "canhoes-tap absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300/70 bg-stone-100/95 p-1.5 text-stone-900 shadow-md transition-all sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35";
  const currentImageUrl = media[currentIndex] ?? media[0];

  const markAsFailed = (url: string) => {
    setFailedMedia((previousState) =>
      previousState[url] ? previousState : { ...previousState, [url]: true }
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-xl border border-[rgba(74,92,47,0.28)] bg-gradient-to-br from-stone-950 via-[#1a2e1a] to-stone-900 p-2 shadow-[var(--shadow-paper-soft)]">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-stone-900 via-[#223122] to-stone-950">
          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden transition-all duration-300",
              frameHeightClassName
            )}
            style={{ touchAction: "pan-y" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {media.length === 1 ? (
              failedMedia[currentImageUrl] ? (
                <MediaFallback />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={absMediaUrl(currentImageUrl)}
                  alt="Media do post"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className={cn("rounded-xl transition-all duration-300", imageClassName)}
                  onError={() => markAsFailed(currentImageUrl)}
                />
              )
            ) : (
              <div
                className="flex h-full w-full transition-transform duration-300"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  willChange: "transform",
                }}
              >
                {media.map((url, index) => (
                  <div
                    key={url}
                    aria-hidden={index !== currentIndex}
                    className="flex min-w-full items-center justify-center overflow-hidden px-1"
                  >
                    {failedMedia[url] ? (
                      <MediaFallback />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={absMediaUrl(url)}
                        alt={`Imagem ${index + 1} de ${media.length}`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        sizes="(max-width: 768px) 100vw, 768px"
                        className={cn("rounded-xl transition-all duration-300", imageClassName)}
                        onError={() => markAsFailed(url)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isImageExpanded ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
            ) : null}

            {media.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((previousIndex) => Math.max(0, previousIndex - 1))
                  }
                  aria-label="Imagem anterior"
                  className={cn("left-2", navButtonClassName)}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((previousIndex) =>
                      Math.min(media.length - 1, previousIndex + 1)
                    )
                  }
                  aria-label="Proxima imagem"
                  className={cn("right-2", navButtonClassName)}
                  disabled={currentIndex === media.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            {media.length > 1 ? (
              <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-stone-100">
                {currentIndex + 1} / {media.length}
              </span>
            ) : null}

            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-3 right-3 z-10 h-8 rounded-full border border-stone-200 bg-stone-100 px-3 text-xs font-medium text-stone-900 shadow-md hover:bg-stone-200"
              onClick={() => setIsImageExpanded((currentValue) => !currentValue)}
            >
              {isImageExpanded ? "Compactar" : "Ver imagem completa"}
            </Button>
          </div>
        </div>
      </div>

      {media.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {media.map((url, index) => (
            <button
              key={`dot-${url}-${index}`}
              type="button"
              aria-label={`Ir para imagem ${index + 1}`}
              className={cn(
                "canhoes-tap h-1.5 rounded-full transition-all",
                index === currentIndex
                  ? "w-6 bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]"
                  : "w-2 bg-stone-400/50 hover:bg-stone-300/70"
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MediaFallback() {
  return (
    <div className="flex min-h-64 w-full flex-col items-center justify-center gap-2 bg-stone-100 px-4 text-center">
      <ImageOff className="h-5 w-5 text-stone-700" />
      <p className="text-sm font-medium text-stone-900">{feedCopy.media.unavailable}</p>
      <p className="max-w-[18rem] text-xs text-stone-700">{feedCopy.media.detail}</p>
    </div>
  );
}
