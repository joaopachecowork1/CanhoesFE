# Backend Implementation Guide — Endpoints Faltantes

**Gerado:** 2026-04-11
**Prioridade:** 🔴 Crítico — 20 endpoints que o frontend chama dão 404

---

## Resumo

O frontend (`canhoesEventsRepo.ts`) chama **20 endpoints** que não existem no backend.
Todos têm equivalentes em controllers legacy (`api/canhoes/`, `api/hub/`) mas precisam
de versões event-scoped em `api/v1/events/{eventId}/`.

---

## 1. Nomeações User-Facing (3 endpoints)

**Fonte legacy:** `CanhoesController.GetNominees`, `CanhoesController.CreateNominee`

### `GET /v1/events/{eventId}/nominations/my-status`
- **Handler:** `GetMyNominationStatus`
- **Auth:** Requer autenticação (user)
- **Retorna:** `MyNominationStatusDto[]` — uma entrada por categoria, com `categoryId`, `hasNominated`, `nomineeTitle`
- **Lógica:** `SELECT * FROM Nominees WHERE EventId = {eventId} AND AuthorUserId = currentUserId`

### `POST /v1/events/{eventId}/nominations`
- **Handler:** `CreateNomination`
- **Auth:** Requer autenticação + fase PROPOSALS aberta
- **Body:** `CreateNomineeRequest { categoryId: string?, kind: "nominees"|"stickers", title: string }`
- **Retorna:** `NomineeDto`
- **Lógica:** Validar módulo access → criar Nominee com `Status = "pending"`

### `GET /v1/events/{eventId}/nominations/approved`
- **Handler:** `GetApprovedNominees`
- **Auth:** Pública (qualquer user autenticado no evento)
- **Query:** `?categoryId={id}` (opcional)
- **Retorna:** `NomineeDto[]` — apenas `Status = "approved"`
- **Lógica:** `SELECT * FROM Nominees WHERE EventId = {eventId} AND Status = 'approved'`

---

## 2. Votação Oficial (2 endpoints)

### `GET /v1/events/{eventId}/official-voting`
- **Handler:** `GetOfficialVotingBoard`
- **Auth:** Requer autenticação + módulo Voting visível
- **Retorna:** `OfficialVotingBoardDto { canVote: bool, categories: OfficialVotingCategoryDto[] }`
- **Lógica:** Similar a `GetVotingBoard` mas para categorias `UserVote`

### `POST /v1/events/{eventId}/official-votes`
- **Handler:** `CastOfficialVote`
- **Auth:** Requer autenticação + módulo Voting visível
- **Body:** `CastOfficialVoteRequest { categoryId: string, nomineeId: string }`
- **Retorna:** `OfficialVoteDto`
- **Lógica:** Validar fase → upsert vote → recalcular contadores

---

## 3. User-Facing: Measures, Results, Members (5 endpoints)

**Fonte legacy:** `CanhoesController.GetMeasures`, `CanhoesController.GetResults`, `CanhoesController.GetMembers`

### `GET /v1/events/{eventId}/measures`
- **Handler:** `GetMeasures`
- **Auth:** Pública
- **Retorna:** `GalaMeasureDto[]` — medidas com `Status = "approved"`
- **Lógica:** `SELECT * FROM Measures WHERE EventId = {eventId} AND Status = 'approved'`

### `POST /v1/events/{eventId}/measures/proposals`
- **Handler:** `CreateMeasureProposal`
- **Auth:** Requer autenticação + módulo Measures visível
- **Body:** `CreateMeasureProposalRequest { text: string }`
- **Retorna:** `MeasureProposalDto`

### `GET /v1/events/{eventId}/results`
- **Handler:** `GetResults`
- **Auth:** Pública + módulo Gala visível
- **Retorna:** `CanhoesCategoryResultDto[]` — top 3 por categoria
- **Lógica:** Agregar votos por categoria → top 3 nominees

### `GET /v1/events/{eventId}/members`
- **Handler:** `GetMembers`
- **Auth:** Requer autenticação (membro do evento)
- **Retorna:** `PublicUserDto[]` — membros do evento
- **Lógica:** `SELECT u.* FROM EventMembers em JOIN Users u ON em.UserId = u.Id WHERE em.EventId = {eventId}`

---

## 4. Uploads (2 endpoints)

**Fonte legacy:** `CanhoesController.UploadNomineeImage`, `CanhoesController.UploadWishlistImage`

### `POST /v1/events/{eventId}/nominations/{nomineeId}/upload`
- **Handler:** `UploadNomineeImage`
- **Auth:** Requer autenticação
- **Content-Type:** `multipart/form-data` (campo: `file`)
- **Retorna:** `NomineeDto` com `ImageUrl` atualizado
- **Lógica:** Validar ownership → salvar media → atualizar `Nominee.ImageUrl`
- **Storage:** Reutilizar `HubPostMediaEntity` ou armazenamento em `wwwroot/uploads/`

### `POST /v1/events/{eventId}/wishlist/{itemId}/upload`
- **Handler:** `UploadWishlistImage`
- **Auth:** Requer autenticação (owner do item)
- **Content-Type:** `multipart/form-data` (campo: `file`)
- **Retorna:** `EventWishlistItemDto` com `ImageUrl` atualizado

---

## 5. Wishlist Delete (1 endpoint)

### `DELETE /v1/events/{eventId}/wishlist/{itemId}`
- **Handler:** `DeleteWishlistItem`
- **Auth:** Requer autenticação (owner do item)
- **Retorna:** `204 No Content`

---

## 6. Feed Interactions (8 endpoints)

**Fonte legacy:** `HubController` (todos os endpoints `api/hub/...`)

### `GET /v1/events/{eventId}/feed/posts/{postId}/comments`
- **Handler:** `GetPostComments`
- **Auth:** Requer autenticação
- **Retorna:** `FeedCommentDto[]`

### `POST /v1/events/{eventId}/feed/posts/{postId}/comments`
- **Handler:** `CreateComment`
- **Auth:** Requer autenticação
- **Body:** `CreateFeedCommentRequest { text: string }`
- **Retorna:** `FeedCommentDto`

### `DELETE /v1/events/{eventId}/feed/posts/{postId}/comments/{commentId}`
- **Handler:** `DeleteComment`
- **Auth:** Requer autenticação (owner ou admin)
- **Retorna:** `204 No Content`

### `POST /v1/events/{eventId}/feed/posts/{postId}/reactions`
- **Handler:** `ToggleReaction`
- **Auth:** Requer autenticação
- **Body:** `{ emoji: string }`
- **Retorna:** `FeedReactionDto { emoji: string, count: number }`

### `POST /v1/events/{eventId}/feed/posts/{postId}/poll/vote`
- **Handler:** `VotePoll`
- **Auth:** Requer autenticação
- **Body:** `{ optionId: string }`
- **Retorna:** `FeedPollVoteDto`

### `POST /v1/events/{eventId}/feed/uploads`
- **Handler:** `UploadFeedMedia`
- **Auth:** Requer autenticação
- **Content-Type:** `multipart/form-data` (campo: `file`)
- **Retorna:** `{ url: string }`

### `POST /v1/events/{eventId}/feed/posts/{postId}/pin` (admin)
- **Handler:** `AdminTogglePin`
- **Auth:** Requer admin do evento
- **Retorna:** `{ pinned: bool }`

### `DELETE /v1/events/{eventId}/feed/posts/{postId}` (admin)
- **Handler:** `AdminDeletePost`
- **Auth:** Requer admin do evento
- **Retorna:** `204 No Content`

---

## DTOs Necessários

```csharp
// FeedCommentDto (já existe como HubCommentDto → adaptar)
public record FeedCommentDto(
    string Id, string PostId, string UserId, string UserName,
    string Text, Dictionary<string, int> ReactionCounts,
    string[] MyReactions, DateTime CreatedAtUtc);

// FeedReactionDto
public record FeedReactionDto(string Emoji, int Count);

// FeedPollVoteDto
public record FeedPollVoteDto(string OptionId, int VoteCount);

// MyNominationStatusDto (já existe)
// OfficialVotingBoardDto (já existe em EventsController.MemberExperience.cs)
```

---

## Notas de Implementação

1. **Arquivo do controller:** Criar `EventsController.Feed.cs` como partial class para os 8 endpoints de feed
2. **Access control:** Usar `RequireEventModuleAccessAsync` para posts/comments
3. **Upload:** Reutilizar a lógica de `HubController.Upload` mas filtrar por `EventId`
4. **DB:** Todas as tabelas já existem (`HubPosts`, `HubPostComments`, `HubPostReactions`, etc.) — só falta filtrar por `EventId`
5. **CORS:** Já configurado via `CorsExtensions.cs` — não precisa de alterações
6. **Auth:** Já validado via Google JWT no `UserContextMiddleware` — não precisa de alterações

---

## Tempo Estimado

| Categoria | Endpoints | Horas |
|---|---|---|
| Nomeações | 3 | 2h |
| Votação oficial | 2 | 1h |
| Measures/Results/Members | 5 | 3h |
| Uploads | 2 | 1.5h |
| Wishlist delete | 1 | 0.5h |
| Feed interactions | 8 | 5h |
| **Total** | **20** | **~13h** |
