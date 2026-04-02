"use client";

import { useMemo } from "react";

import type {
  EventOverviewDto,
  EventPhaseDto,
} from "@/lib/api/types";
import type { CanhoesMemberModuleKey } from "@/lib/modules";

/**
 * Module access state for a single module, combining backend-computed
 * visibility with any additional frontend business logic.
 */
export type ModuleAccessState = {
  /**
   * Whether the module is visible and accessible to the current user.
   * This is the primary flag to check for navigation and routing.
   */
  isAccessible: boolean;

  /**
   * Whether the module exists in the backend modules configuration.
   * False if backend explicitly disabled it or if data hasn't loaded.
   */
  isConfigured: boolean;

  /**
   * Human-readable reason why module is not accessible (if applicable).
   * Used for showing locked/unavailable UI states.
   */
  blockReason?: string;
};

/**
 * Centralized event access control hook.
 *
 * This is the single source of truth for determining:
 * - Which modules are accessible to the current user
 * - Whether navigation items should be shown
 * - Whether routes should be accessible
 * - What blocked/locked UI states to display
 *
 * The hook consumes `EventOverviewDto` from the backend, which should
 * already include phase-aware module visibility computed server-side.
 * This hook adds defensive frontend logic and provides a clean API.
 */
export function useEventAccess(overview: EventOverviewDto | null | undefined) {
  const modules = overview?.modules;
  const activePhase = overview?.activePhase;
  const isAdmin = overview?.permissions?.isAdmin ?? false;

  /**
   * Check if a specific module is accessible.
   * Combines backend module state with any additional frontend rules.
   */
  const checkModuleAccess = useMemo(() => {
    return (moduleKey: CanhoesMemberModuleKey): ModuleAccessState => {
      // If data not loaded, be permissive (avoid blocking UI before data arrives)
      if (!modules) {
        return {
          isAccessible: true,
          isConfigured: false,
        };
      }

      // Admin module is always accessible to admins only
      if (moduleKey === "feed" || moduleKey === "categories") {
        // Core modules like feed and categories should generally be available
        // unless explicitly disabled by backend
        return {
          isAccessible: modules[moduleKey] ?? true,
          isConfigured: true,
        };
      }

      // Get backend-computed visibility
      const isVisible = modules[moduleKey] ?? false;

      // If backend says not visible, respect that
      if (!isVisible) {
        return {
          isAccessible: false,
          isConfigured: true,
          blockReason: getPhaseBlockReason(moduleKey, activePhase),
        };
      }

      // Backend says visible - module is accessible
      return {
        isAccessible: true,
        isConfigured: true,
      };
    };
  }, [modules, activePhase]);

  /**
   * Check if admin panel is accessible.
   */
  const isAdminAccessible = useMemo(() => {
    return isAdmin;
  }, [isAdmin]);

  /**
   * Get all accessible module keys for the current user.
   * Useful for filtering lists of modules.
   */
  const accessibleModules = useMemo(() => {
    if (!modules) return [];

    const moduleKeys: CanhoesMemberModuleKey[] = [
      "feed",
      "secretSanta",
      "wishlist",
      "categories",
      "voting",
      "gala",
      "stickers",
      "measures",
      "nominees",
    ];

    return moduleKeys.filter((key) => checkModuleAccess(key).isAccessible);
  }, [modules, checkModuleAccess]);

  return {
    /**
     * Check access for a specific module.
     */
    checkModuleAccess,

    /**
     * List of all accessible module keys.
     */
    accessibleModules,

    /**
     * Whether admin panel is accessible.
     */
    isAdminAccessible,

    /**
     * Current active phase (for display purposes).
     */
    activePhase,

    /**
     * Whether the user is an admin.
     */
    isAdmin,

    /**
     * The raw modules object from backend (for advanced use cases).
     */
    modules,
  };
}

/**
 * Helper to provide user-friendly explanation for why a module might be blocked.
 * This is defensive - backend should be the source of truth, but frontend can
 * provide helpful messaging based on phase context.
 */
function getPhaseBlockReason(
  moduleKey: CanhoesMemberModuleKey,
  activePhase?: EventPhaseDto | null
): string | undefined {
  if (!activePhase) {
    return "Modulo nao disponivel neste momento";
  }

  const phaseType = activePhase.type;

  // These are hints based on typical phase restrictions
  // Backend is still the source of truth - this is just for UX
  switch (moduleKey) {
    case "voting":
      if (phaseType !== "VOTING") {
        return "A votacao ainda nao esta aberta";
      }
      break;
    case "gala":
      if (phaseType !== "RESULTS") {
        return "A gala ainda nao esta disponivel";
      }
      break;
    case "secretSanta":
      if (phaseType === "RESULTS") {
        return "O Amigo Secreto ja terminou";
      }
      break;
  }

  return "Modulo nao disponivel nesta fase";
}
