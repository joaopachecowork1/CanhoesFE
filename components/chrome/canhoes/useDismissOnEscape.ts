"use client";

import { useEffect } from "react";

/**
 * Dismisses an overlay when the Escape key is pressed.
 * Used for modals, menus, and other temporary UI elements.
 */
export function useDismissOnEscape(
  isOpen: boolean,
  onDismiss: () => void
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onDismiss]);
}
