/**
 * Barrel re-export for backwards compatibility.
 * Individual components live in ./shared/ — prefer direct imports in new code.
 */

export { CanhoesModuleHeader } from "./shared/CanhoesModuleHeader";
export { CanhoesMediaThumb } from "./shared/CanhoesMediaThumb";
export { CanhoesFileTrigger } from "./shared/CanhoesFileTrigger";
export { CanhoesFeatureCard } from "./shared/CanhoesFeatureCard";
export { getNomineeStatusBadgeVariant } from "./shared/nomineeUtils";
export { getPhaseLabel as formatEventPhaseLabel } from "@/lib/canhoesEvent";
