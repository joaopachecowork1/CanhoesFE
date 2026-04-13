# Module Visibility & Access Control Integration

## Overview

This document describes the end-to-end integration between frontend and backend for module visibility and access control in the Canhões do Ano application.

## Architecture

### Backend Responsibilities

The backend is the **single source of truth** for module visibility. It must:

1. **Store admin configuration** (`moduleVisibility` in `EventAdminStateDto`)
   - Represents what modules the admin has enabled/disabled
   - 9 module keys: feed, secretSanta, wishlist, categories, voting, gala, stickers, measures, nominees

2. **Compute effective visibility** based on:
   - Admin's `moduleVisibility` settings
   - Current event phase (`activePhase.type`: DRAW, PROPOSALS, VOTING, RESULTS)
   - Any other business rules (e.g., voting only available in VOTING phase)

3. **Return computed visibility** in TWO places:
   - **Admin bootstrap**: `/v1/events/{eventId}/admin/bootstrap`
     - Returns `state.effectiveModules` as a **member-facing preview**
     - This preview should reflect what a regular member sees after phase rules + admin overrides
     - `admin` should stay `false` here because the payload is not describing admin access

   - **Member overview**: `/v1/events/{eventId}/overview`
     - Returns `modules` for the **current authenticated user**
     - Used by frontend navigation and access control

**CRITICAL**: The admin preview (`state.effectiveModules`) and the member overview (`modules`) MUST use the same member-facing rules. Any mismatch will cause navigation/access inconsistency.

**Important nuance**: an admin user's own `/overview.modules` may still differ because admins keep direct access to all modules. Compare the admin preview to a member overview, not to the admin's own overview payload.

### Frontend Responsibilities

The frontend **consumes** backend-computed visibility and enforces it at multiple levels:

1. **Navigation filtering** (`canhoesNavigation.ts`)
   - Bottom tabs show only accessible modules
   - "More" menu filters based on `overview.modules`
   - Uses `isNavItemAvailable()` function

2. **Route access guards** (all module pages)
   - `EventModuleGate` component wraps each module
   - Checks access via `useEventModuleAccess()` hook
   - Shows locked UI or redirects if module not accessible

3. **Centralized access logic** (`useEventModuleAccess` hook)
   - Single hook consuming `EventOverviewDto`
   - Provides `checkModuleAccess()` for per-module checks
   - Includes defensive logic and fallback messaging

## Data Flow

### Admin Changes Module Visibility

```
1. Admin toggles module in AdminModulesSection
2. Frontend calls PUT /v1/events/{eventId}/admin/state
3. Backend updates moduleVisibility
4. Backend recomputes effectiveModules based on phase
5. Backend returns updated EventAdminStateDto
6. Frontend calls refreshEventOverview() (custom event)
7. All clients listening to REFRESH_EVENT_OVERVIEW_EVENT refresh
8. Member navigation updates to show/hide module
```

### Admin Changes Event Phase

```
1. Admin selects new phase in AdminPhaseSection
2. Frontend calls PUT /v1/events/{eventId}/admin/phase
3. Backend updates activePhase
4. Backend recomputes effectiveModules based on new phase
5. Backend returns updated EventAdminStateDto
6. Frontend calls refreshEventOverview() (custom event)
7. All clients listening to REFRESH_EVENT_OVERVIEW_EVENT refresh
8. Member navigation updates based on phase-restricted modules
```

### Member Views Module

```
1. Page component renders (e.g., /canhoes/votacao)
2. EventModuleGate wraps module content
3. Guard calls useEventModuleAccess(moduleKey)
4. Hook checks overview.modules.voting
5a. If true: renders module content
5b. If false: shows locked UI with phase-appropriate message
```

### Phase Window Note

`EndDateUtc` already affects behaviour today, but not everywhere in the same way:

- `IsPhaseOpen()` uses `StartDateUtc <= now <= EndDateUtc`
- `canSubmitProposal` / `canVote` and write endpoints depend on `IsPhaseOpen()`
- `BuildModuleVisibility()` currently depends on the active phase type and admin overrides, not directly on the time window

That means a module can remain visible while the active phase window is already closed for writes. Do not "fix" that casually without an explicit product decision on `EndDateUtc`.

## Key Files

### Backend API (Expected Endpoints)

- `GET /v1/events/{eventId}/overview` - Returns `EventOverviewDto` with computed `modules`
- `GET /v1/events/{eventId}/admin/bootstrap` - Returns `EventAdminBootstrapDto` with `state.effectiveModules`
- `PUT /v1/events/{eventId}/admin/state` - Updates `moduleVisibility`, returns updated `EventAdminStateDto`
- `PUT /v1/events/{eventId}/admin/phase` - Changes phase, returns updated `EventAdminStateDto`

### Frontend Implementation

**Core Hooks:**
- `/hooks/useEventOverview.ts` - Loads and refreshes event overview for members
- `/hooks/useEventModuleAccess.ts` - Centralized access control logic
- `/hooks/useModuleVisibility.ts` - Admin module configuration management
- `/hooks/useAdminBootstrap.ts` - Loads admin state

**Access Control:**
- `/components/modules/canhoes/EventModuleGate.tsx` - Route-level access guard component

**Navigation:**
- `/components/chrome/canhoes/canhoesNavigation.ts` - Navigation item filtering logic
- `/components/chrome/canhoes/useCanhoesShellNavigation.ts` - Shell navigation composition
- `/components/chrome/canhoes/CanhoesChrome.tsx` - Main chrome component

**Module Pages (all protected with EventModuleGate):**
- `/app/canhoes/(app)/votacao/page.tsx` - Voting module
- `/app/canhoes/(app)/amigo-secreto/page.tsx` - Secret Santa module
- `/app/canhoes/(app)/wishlist/page.tsx` - Wishlist module
- `/app/canhoes/(app)/categorias/page.tsx` - Categories module
- `/app/canhoes/(app)/gala/page.tsx` - Gala module
- `/app/canhoes/(app)/stickers/page.tsx` - Stickers module
- `/app/canhoes/(app)/medidas/page.tsx` - Measures module
- `/app/canhoes/(app)/nomeacoes/page.tsx` - Nominees module

**Admin Panel:**
- `/components/modules/canhoes/admin/CanhoesAdminModule.tsx` - Main admin module
- `/components/modules/canhoes/admin/components/AdminModulesSection.tsx` - Module visibility controls
- `/components/modules/canhoes/admin/components/AdminPhaseSection.tsx` - Phase controls

## Common Issues & Solutions

### Issue: Admin enables module but members still can't see it

**Root Cause:**
- Backend `/overview` endpoint returns outdated `modules` state
- OR backend doesn't properly compute `modules` based on phase

**Solution:**
1. Verify backend computes `modules` field in `/overview` response
2. Check backend applies same logic as `effectiveModules` in admin state
3. Verify backend doesn't cache `/overview` response improperly
4. Check frontend calls `refreshEventOverview()` after admin changes

### Issue: Navigation shows module but clicking gives 404 or blocked UI

**Root Cause:**
- Module page doesn't have `EventModuleGate` wrapper
- OR guard uses different module key than navigation

**Solution:**
1. Add `EventModuleGate` to page component
2. Verify `moduleKey` matches mapping in `MODULE_KEY_BY_ITEM_ID`

### Issue: Phase change doesn't update member navigation

**Root Cause:**
- Backend doesn't recompute `modules` when phase changes
- OR frontend doesn't refresh overview after phase change

**Solution:**
1. Verify backend recalculates `modules` on phase transition
2. Check `handleUpdatePhase()` in admin module calls `handleRefresh()`
3. Verify `handleRefresh()` calls `refreshEventOverview()`
4. Check `useEventOverview` hook listens to `REFRESH_EVENT_OVERVIEW_EVENT`

## Testing Checklist

### Manual Testing

1. **Admin enables module:**
   - [ ] Admin sees module as "ON" in admin panel
   - [ ] Member navigation shows module after refresh
   - [ ] Member can access module page
   - [ ] Module content loads without errors

2. **Admin disables module:**
   - [ ] Admin sees module as "OFF" in admin panel
   - [ ] Member navigation hides module after refresh
   - [ ] Direct URL access shows locked UI
   - [ ] No errors in console

3. **Phase change restricts module:**
   - [ ] Admin changes phase (e.g., PROPOSALS → VOTING)
   - [ ] Admin sees module status as "Fase" (phase-blocked)
   - [ ] Member navigation hides phase-restricted modules
   - [ ] Member sees appropriate locked message if accessing directly

4. **Phase change enables module:**
   - [ ] Module enabled by admin but blocked by previous phase
   - [ ] Admin changes to phase that allows module (e.g., VOTING phase enables voting module)
   - [ ] Member navigation shows module
   - [ ] Member can access and use module

5. **Expired phase window:**
   - [ ] Active phase remains selected but `EndDateUtc` is in the past
   - [ ] `overview.permissions.canVote` / `canSubmitProposal` close correctly
   - [ ] Navigation behaviour matches the current product decision instead of ad-hoc client logic

### Expected Behavior by Phase

**DRAW Phase:**
- Core: feed, categories (usually visible)
- Community: secretSanta, wishlist (Santa preparation)
- Finale: typically hidden

**PROPOSALS Phase:**
- Core: feed, categories (proposals flow)
- Community: nominees, stickers (submissions)
- Voting/Gala: typically hidden

**VOTING Phase:**
- Core: feed, categories, voting (main voting)
- Community: nominees (reference)
- Gala: typically hidden

**RESULTS Phase:**
- Core: feed (discussions)
- Community: typically winding down
- Finale: gala, measures (finale content)

## Implementation Notes

### Why Not Client-Side Phase Logic?

The frontend **could** implement phase-aware logic (e.g., "hide voting module if phase !== VOTING"), but this would:
- Duplicate backend business logic
- Create integration mismatches when rules change
- Make it harder to add new phase types or rules

Instead, frontend trusts backend-computed `modules` field as single source of truth.

### Defensive Programming

The `useEventModuleAccess` hook includes defensive logic:
- Returns permissive state while data loads (avoid blocking UI)
- Provides fallback messages for blocked states
- Includes phase-aware hints for better UX

The `EventModuleGate` component:
- Shows loading state during data fetch
- Renders clear locked UI with explanation
- Supports redirect mode for critical restrictions

### Admin vs Member Experience

**Admin sees two states:**
- `moduleVisibility`: What admin configured (toggle state)
- `effectiveModules`: What's actually visible (computed by backend)

**Admin UI shows status badge:**
- "ON": Module enabled and allowed by phase
- "OFF": Module disabled by admin
- "Fase": Module enabled but blocked by current phase

**Members see one state:**
- `modules`: The final computed visibility (same as `effectiveModules`)

## Future Enhancements

### Permissions Beyond Modules

If future needs require granular permissions (e.g., "can vote", "can submit proposals"), extend `EventPermissionsDto`:

```typescript
export type EventPermissionsDto = {
  isAdmin: boolean;
  isMember: boolean;
  canPost: boolean;
  canSubmitProposal: boolean;
  canVote: boolean;
  canManage: boolean;
  // Add new permissions here
};
```

Frontend can check via `overview.permissions` rather than module visibility.

### Module-Level Phase Requirements

If modules need complex phase requirements, add to backend:

```typescript
export type EventModuleStateDto = {
  key: string;
  isVisible: boolean;
  requiredPhases?: EventPhaseDto["type"][];
  blockReason?: string;
};
```

This allows backend to explain **why** module is blocked.

### Real-Time Updates

For multi-tab/multi-device sync, consider:
- WebSocket connection for admin change notifications
- Server-Sent Events for phase transitions
- Polling with exponential backoff

Currently relies on custom events within same browser context.

## Support

For issues with module visibility integration:
1. Check browser console for errors
2. Verify `/overview` endpoint response includes correct `modules` object
3. Test with mock mode (`NEXT_PUBLIC_MOCK_AUTH=true`) to isolate backend issues
4. Review admin panel to see `effectiveModules` vs `moduleVisibility` state
