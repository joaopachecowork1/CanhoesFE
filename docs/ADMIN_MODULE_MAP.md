# Admin Module Map

Mapa operacional do admin no `CanhoesFE`, alinhado com o vault e com a surface event-scoped atual.

## Canonical modules

| Módulo canónico | Entry point atual | Componente principal | Fonte de dados |
|---|---|---|---|
| Evento | `/canhoes/admin/configuracoes` | `AdminControlCenter` | `useAdminBootstrap().state`, `events` |
| Feed | Sem secção dedicada de admin | Admin do feed vive nas ações de moderação do próprio feed | `overview.modules.feed`, ações de feed/hub |
| Nomeações | `/canhoes/admin/conteudo?view=queue` | `AdminNominationsSection` | `admin/nominations/paged`, `admin/nominations/summary`, `admin/categories/summary` |
| Categorias | `/canhoes/admin/conteudo?view=categorias` | `CategoriesAdmin` | `admin/categories`, `admin/categories/summary`, `admin/nominations/summary`, `admin/votes/paged` |
| Amigos | `/canhoes/admin/membros` | `SecretSantaAdmin` + `AdminMembersSection` | `admin/secret-santa/state`, `admin/members/paged` |
| Pendentes | `/canhoes/admin/conteudo?view=queue` | `PendingProposals` | `admin/category-proposals`, `admin/measure-proposals` |

## Secondary admin surfaces

- `Resumo` em `/canhoes/admin/dashboard`
  - leitura rápida do evento, fila e atividade recente
  - não substitui fluxos operacionais dedicados

- `Resultados` em `/canhoes/admin/conteudo?view=resultados`
  - resultados oficiais e auditoria
  - fica isolado da moderação corrente

## Guard rails

- Backend continua a ser a source of truth para `overview.modules` e `state.effectiveModules`.
- Surface preferencial: `EventsController.*`, com bootstrap leve e listas carregadas por secção.
- Não criar secções falsas de admin para módulos que ainda não têm ações reais dedicadas.
- Quando houver dúvida de navegação, preferir:
  - rota dedicada se já houver ações reais
  - caso contrário, explicitar no copy onde essa gestão vive hoje
