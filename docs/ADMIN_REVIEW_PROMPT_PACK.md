# Admin Review Prompt Pack

Prompts prontos para sessões de review e simplificação do admin, alinhados com o vault e com o estado atual do `CanhoesFE`.

## Prompt 1 — Review do Admin Surface

```text
Lê `AGENTS.md`, `BOOT.md`, `docs/ADMIN_MODULE_MAP.md` e a documentação do vault já refletida em `canhoes-vault/README.md`, `Backlog.md`, `domain/EventModule.md`, `domain/EventPhase.md`, `domain/AccessEvaluator.md` e `decisions/ADR-001-api-split.md`.

Atua como code reviewer sénior de frontend com foco em produto, mobile-first e manutenção.

Objetivo:
Auditar o módulo admin do CanhoesFE e listar bugs, regressões, inconsistências de UX e dívida técnica que estejam a afastar o admin dos módulos canónicos: Evento, Feed, Nomeações, Categorias, Amigos, Pendentes.

Âmbito:
- `components/modules/canhoes/admin/*`
- route layer do admin
- labels, headers, tabs, entry points, bootstrap consumer
- não editar ficheiros

Regras:
- backend é source of truth
- não propor crescimento do legacy API
- findings primeiro, por severidade
- usar referências de ficheiro e linha
- focar em responsabilidades misturadas, duplicação, affordances falsas, excesso de chrome mobile, e mismatch entre módulo canónico e secção real

Entrega:
1. findings ordenados por severidade
2. gaps de arquitetura
3. simplificações seguras recomendadas
4. riscos de regressão
```

## Prompt 2 — Review do Access/Visibility Contract

```text
Lê `AGENTS.md`, `BOOT.md`, `docs/MODULE_VISIBILITY_INTEGRATION.md`, `docs/ADMIN_MODULE_MAP.md` e a documentação relevante do vault. Depois audita o contrato de visibilidade entre backend e frontend.

Objetivo:
Confirmar que o frontend não está a reimplementar regras de fase ou visibilidade que pertencem ao backend.

Âmbito:
- `useEventOverview`
- `useEventModuleAccess`
- `useModuleVisibility`
- `useAdminBootstrap`
- `EventModuleGate`
- navegação Canhoes
- bootstrap/admin consumers
- sem editar ficheiros

Critérios:
- comparar `overview.modules` vs `state.effectiveModules`
- validar refresh após mudança de fase ou toggles
- identificar duplicação de lógica de fase no cliente
- sinalizar qualquer dependência indevida de surface legacy
- findings com impacto funcional primeiro

Entrega:
- lista de findings
- contratos ou tipos suspeitos
- pontos onde FE devia confiar mais no backend
- testes de regressão recomendados
```

## Prompt 3 — Review de Auth e Gating Operacional

```text
Atua como reviewer sénior para autenticação e route gating no CanhoesFE/CanhoesBE.

Objetivo:
Auditar login Google, auth context, proxy auth e gating de admin para perceber se existe qualquer caminho que mascare autenticação real, degrade UX ou crie risco operacional.

Âmbito:
- `auth.ts`
- login page
- `AuthContext`
- `/api/me`
- `/api/proxy/[...path]`
- backend auth pipeline e config
- sem editar ficheiros

Foco:
- mock auth fora de dev
- falhas silenciosas de callback
- dependência de `id_token`
- mensagens de erro opacas
- admin acessível sem sessão válida

Entrega:
- findings por severidade
- causa provável de cada risco
- correções mínimas recomendadas
- validações manuais necessárias em deploy
```

## Prompt 4 — Simplificar Orquestração do Admin

```text
Lê a documentação do vault, `docs/ADMIN_MODULE_MAP.md` e simplifica a orquestração do admin no CanhoesFE sem rewrite total.

Objetivo:
Tornar `CanhoesAdminModule` e a route layer do admin mais pequenos, claros e alinhados com os módulos canónicos.

Ownership:
- `components/modules/canhoes/admin/CanhoesAdminModule.tsx`
- `components/modules/canhoes/admin/adminSections.ts`
- `components/modules/canhoes/admin/components/AdminSectionShell.tsx`
- `components/modules/canhoes/admin/components/AdminRouteTabs.tsx`
- route layer do admin

Regras:
- mobile-first
- um único padrão de navegação
- preservar deep-link por secção
- reduzir props e branching no módulo principal
- não inventar sistema paralelo

Critérios de aceitação:
- menos chrome acima do conteúdo
- labels curtas
- composição menor e mais legível
- mapping claro entre secção, rota e responsabilidade
```

## Prompt 5 — Simplificar Bootstrap e Consumers do Admin

```text
Lê a documentação do vault e `docs/ADMIN_MODULE_MAP.md`. Depois simplifica o consumo do admin bootstrap no CanhoesFE.

Objetivo:
Reduzir duplicação, normalização defensiva dispersa e props excessivas sem alterar comportamento confirmado.

Ownership:
- `hooks/useAdminBootstrap.ts`
- consumidores diretos do bootstrap no admin
- tipos FE associados, se estritamente necessário

Regras:
- backend é source of truth
- não alterar contratos sem necessidade real
- respeitar coexistência de surfaces novo/legacy
- reduzir transformação repetida em componentes
- tornar loading/error states mais uniformes

Critérios de aceitação:
- hook mais previsível
- menos derivação repetida nos componentes
- mensagens de erro consistentes
- código menor e mais fácil de testar
```

## Prompt 6 — Simplificar CRUD Mobile-First

```text
Lê a documentação do vault e simplifica o CRUD operacional do admin no CanhoesFE.

Objetivo:
Deixar as áreas de Categorias, Nomeações e Pendentes utilizáveis em 375px, sem affordances falsas nem master-detail empilhado.

Ownership:
- componentes diretamente usados pelo CRUD dessas áreas
- hooks e forms diretamente ligados
- sem alterar contratos de dados salvo bloqueio real

Regras:
- usar `Sheet` ou `Dialog` para detalhe/edição
- feedback de save/erro visível
- zero botões sem handler real
- reutilizar forms e primitives existentes
- reduzir CSS espalhado entre componentes

Critérios de aceitação:
- fluxo compacto
- código mais curto
- responsabilidades únicas por vista
- nenhum comportamento prometido sem suporte real
```
