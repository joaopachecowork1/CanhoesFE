# Admin Mobile Hierarchy

## Purpose
The admin area should behave like a mobile control center, not a desktop dashboard compressed onto a phone.

## Section order
- `Pendentes` opens first when there is review work waiting.
- `Evento` is the default fallback when there is no pending queue.
- `Categorias`, `Nomeacoes`, `Amigo`, `Membros`, `Votos`, and `Resumo` stay available through the sticky section rail.

This ordering is defined in:
- `components/modules/canhoes/admin/adminSections.ts`

## Sticky layers
- Keep the admin control strip sticky.
- Keep the admin section navigation sticky.
- Avoid adding more sticky layers below those two.

## Mobile priority
The first mobile viewport should answer three questions quickly:
1. What phase is this edition in?
2. Is there anything waiting for review?
3. What is the fastest next admin action?

Because of that:
- pending count is the most important metric
- event/phase state is the second priority
- quick actions for queue, event, and categories are primary on mobile
- members and historical summaries are secondary

## Interaction rules
- Moderation-heavy sections should show approve/reject/edit actions close to the top of each card.
- Secondary information should become collapsible when it increases scroll without helping immediate action.
- Event switching, phase switching, and visibility controls should remain short and readable on one hand.

## Role and visibility note
- The backend remains the source of truth for role and module visibility.
- Non-admin users should see `Mais` in the bottom navigation.
- Admin users should see `Admin` for direct access to the control center.

## Copy direction
- Keep admin language short and operational.
- Use edition/event phrasing instead of generic dashboard phrasing.
- Avoid dev, mock, prototype, or IA-explainer wording in visible admin UI.
