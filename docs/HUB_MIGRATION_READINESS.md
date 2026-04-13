# Hub Migration Readiness

Estado real da migração do feed em `2026-04-11`, com base no código atual de `CanhoesFE` e `CanhoesBE`.

## Resumo

O feed **já é event-bound no modelo**, mas a experiência completa ainda não está pronta para abandonar o surface legacy.

Recomendação atual: **não expandir o legacy, mas também não migrar já o frontend inteiro para event-scoped**. Primeiro é preciso fechar o delta funcional que ainda vive em `HubController.*`.

## O que já está pronto

- `HubPostEntity` já tem `EventId`
- o backend event-scoped já expõe:
  - `GET /v1/events/{eventId}/feed/posts`
  - `POST /v1/events/{eventId}/feed/posts`
- o frontend já tem repositório novo para isso em `canhoesEventsRepo`
- a home do evento já lê posts via `canhoesEventsRepo.getFeedPosts(event.id)`

## O que ainda bloqueia a migração

O fluxo principal do mural continua dependente de `hubRepo` e de `HubController.*` para:

- upload de imagens
- comentários
- likes e reações
- polls
- pin/delete de posts
- delete de comentários
- resolução implícita do evento ativo no backend legacy

Na prática, o módulo `HubFeedModule` e `useHubFeed` continuam ancorados no legacy para quase toda a interação rica do feed.

## Decisão recomendada

### Agora

- congelar o legacy
- não adicionar novos endpoints a `HubController`
- manter features novas do feed fora do legacy

### Próxima sessão de migração

- definir surface event-scoped mínima equivalente para:
  - comments
  - reactions
  - poll vote
  - upload
  - admin moderation
- só depois trocar `hubRepo` por `canhoesEventsRepo` no fluxo principal do mural

## Critério de pronto para migrar

O feed fica pronto para migração quando `useHubFeed` e `CanhoesComposeSheet` deixarem de depender de `hubRepo` para operações interativas.
