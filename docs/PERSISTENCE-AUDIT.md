# PERSISTENCE-AUDIT.md — Auditoria de Persistência e Arquitetura Multi-Target

> **Projeto:** T-Rex HTTP Client  
> **Data:** 06/10/2026  
> **Status:** Concluído (Fase 0 e Fase 1)  

---

## 1. Estado Atual da Persistência

Atualmente, o projeto T-Rex HTTP Client encontra-se com aproximadamente 90% das funcionalidades implementadas, operando com uma combinação de:

1. **Persistência síncrona em `localStorage`:**
   - Exclusiva para o domínio de ambientes (`EnvironmentRepository` e `EnvironmentService`), utilizando as chaves `trex_environments` e `trex_active_environment`.
2. **Estado em memória (In-Memory Module Singletons via `ref`):**
   - Coleções (`CollectionEntity` / `CollectionService` / `useCollections`): Mantidas em memória; alterações são perdidas ao recarregar a página (F5).
   - Configurações e Temas (`SettingsEntity` / `SettingsService` / `useSettings`): Inicializadas com presets estáticos; alterações de tema, densidade, fonte e timeouts são perdidas ao recarregar a página.
   - Abas e Workspace (`useRequest` / `useAppLayout`): Abas ativas, parâmetros, headers, body e estado dirty de requisições não são persistidos.
   - Histórico (`src/features/history/`): Estrutura de pastas existe com `.gitkeep`, mas sem implementação de persistência.
3. **Dexie 4.x instalado:**
   - A dependência `"dexie": "^4.4.6"` já está instalada no `package.json`, porém ainda não foi conectada às camadas de domínio.
4. **PWA configurado:**
   - `vite-plugin-pwa` configurado com Service Worker e Web App Manifest em modo offline-first.

---

## 2. Dados Persistentes Encontrados e Mapeados

| Domínio | Entidade / Dados | Persistir? | Motivo | Mecanismo Atual | Mecanismo Alvo (PWA) | Mecanismo Alvo (Desktop) | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **Collections** | `Collection[]`, `CollectionItem[]` (pastas e requisições salvas) | **SIM** | Dados primários de trabalho do usuário | Em memória (`CollectionEntity`) | Dexie (IndexedDB) `collections` | Drizzle (SQLite) `collections` | **Crítica** |
| **Environments** | `Environment[]` (variáveis chave-valor, máscaras) | **SIM** | Variáveis de configuração essenciais | `localStorage` (`trex_environments`) | Dexie (IndexedDB) `environments` | Drizzle (SQLite) `environments` | **Crítica** |
| **Environments** | `activeEnvironmentId` | **SIM** | Ambiente selecionado pelo usuário | `localStorage` (`trex_active_environment`) | Dexie (IndexedDB) `app_state` | Drizzle (SQLite) `app_state` | **Alta** |
| **Settings** | `ClientSettings` (tema Jurassic, cores JSON, layout, timeouts) | **SIM** | Preferências do usuário | Em memória (`SettingsEntity`) | Dexie (IndexedDB) `settings` | Drizzle (SQLite) `settings` | **Alta** |
| **History** | `RequestHistoryItem[]` (requisições executadas, resposta, tempo) | **SIM** | Histórico e auditoria de chamadas | Não implementado | Dexie (IndexedDB) `history` | Drizzle (SQLite) `history` | **Média** |
| **Workspace / Tabs** | `RequestTab[]`, `activeTabId` | **SIM (Sessão)** | Recuperação de abas abertas após reload | Em memória (`tabsState`) | Dexie (IndexedDB) `workspace_tabs` | Drizzle (SQLite) `workspace_tabs` | **Média** |

---

## 3. Dados Não Persistentes (Transitórios e Derivados)

| Estado | Onde reside | Motivo para NÃO persistir |
| :--- | :--- | :--- |
| `isLoading` | `use-request.ts` / `use-app-layout.ts` | Estado transitório de requisição HTTP ativa |
| `executionResult` (última resposta ativa) | `use-request.ts` | Resposta em visualização na aba atual (o histórico registra a permanência) |
| Modais (`isSettingsOpen`, `isEnvironmentManagerOpen`) | `use-settings.ts`, `use-environment-manager.ts` | Estado transitório de UI |
| Edição inline (`editingCollectionId`, `editingItemId`) | `use-collection-tree.ts` | Foco transitório de interface |
| Visibilidade de senhas (`visibleVariablesSet`) | `use-environment-manager.ts` | Segurança: máscaras devem reiniciar ocultas por padrão |
| `searchQuery` de coleções | `use-collection-tree.ts` | Filtro visual instantâneo |

---

## 4. Gerenciamento de Estado e Stores Envolvidos

O projeto adota o padrão **Feature-Sliced com Composables Presenters como Singletons Reativos** (conforme `../AGENTS.md` e `development-guidelines`):

1. **`useCollections`** (`src/features/collections/use-collections.ts`):
   - Estado: `collectionsState`, `selectedItemIdState`.
   - Ações: `createCollection`, `updateCollection`, `deleteCollection`, `addItem`, `updateItem`, `deleteItem`, `reorderItems`.
2. **`useEnvironments`** (`src/features/environments/use-environments.ts`):
   - Estado: `environmentsState`, `activeEnvironmentIdState`.
   - Ações: `createEnvironment`, `updateEnvironment`, `deleteEnvironment`, `setActiveEnvironment`.
3. **`useSettings`** (`src/features/settings/use-settings.ts`):
   - Estado: `settingsState`, `isSettingsOpen`.
   - Ações: `updateSettings`, `resetSettings`, `openSettings`, `closeSettings`.
4. **`useRequest`** (`src/features/request/use-request.ts`):
   - Estado: `tabsState`, `activeTabIdState`, `executionResultState`, `isLoadingState`.
   - Ações: `openTab`, `closeTab`, `setActiveTab`, `sendRequest`, `updateActiveTab`.
5. **`useAppLayout`** (`src/layouts/AppLayout/use-app-layout.ts`):
   - Orquestra os composables de domínio e sincroniza abas com itens da árvore de coleções.

---

## 5. Composables Envolvidos

- `src/features/collections/use-collections.ts`
- `src/features/collections/CollectionTree/use-collection-tree.ts`
- `src/features/environments/use-environments.ts`
- `src/features/environments/EnvironmentManagerModal/use-environment-manager.ts`
- `src/features/environments/EnvironmentSelector/use-environment-selector.ts`
- `src/features/settings/use-settings.ts`
- `src/features/settings/SettingsModal/use-settings-modal.ts`
- `src/features/request/use-request.ts`
- `src/features/request/RequestBuilder/use-request-builder.ts`
- `src/layouts/AppLayout/use-app-layout.ts`

---

## 6. Componentes Envolvidos

- `src/features/collections/CollectionTree/index.vue`
- `src/features/environments/EnvironmentManagerModal/index.vue`
- `src/features/environments/EnvironmentSelector/index.vue`
- `src/features/settings/SettingsModal/index.vue`
- `src/features/request/RequestBuilder/index.vue`
- `src/layouts/AppLayout/index.vue`

> **Nota:** Todos os componentes `.vue` são estritamente ultra-finos (apenas template e tags em `kebab-case`). Eles delegam 100% de sua lógica para composables. Nenhuma alteração direta no template ou injeção de dependência de storage ocorrerá nos `.vue`.

---

## 7. Serviços e Entidades Envolvidos

- `src/features/collections/collection.entity.ts` (entidade rica de coleções e itens)
- `src/features/collections/collection.service.ts` (serviço orquestrador)
- `src/features/environments/environment.entity.ts` (entidade rica de ambientes e interpolação)
- `src/features/environments/environment.repository.ts` (repositório atual em `localStorage`)
- `src/features/environments/environment.service.ts` (serviço orquestrador de ambientes)
- `src/features/settings/settings.entity.ts` (entidade de preferências do cliente)
- `src/features/settings/settings.service.ts` (serviço de preferências)
- `src/features/request/request-runner.service.ts` (executor HTTP Axios)

---

## 8. Storage Existente e Legado

- **Chaves no `localStorage`:**
  - `trex_environments`: Array serializado em JSON com os ambientes criados.
  - `trex_active_environment`: String com o ID do ambiente selecionado.
- **Estratégia de Migração:**
  - Ao inicializar o banco Dexie (IndexedDB), verificar se há registros legados em `localStorage`.
  - Se houver dados em `localStorage` e o banco IndexedDB estiver vazio: migrar os registros para a tabela `environments`, salvar `activeEnvironmentId` e remover as chaves legadas do `localStorage`.
  - Migração totalmente idempotente, testada e sem risco de perda de dados.

---

## 9. Pontos de Integração e Arquitetura Alvo

### 9.1 Diagrama de Camadas

```text
┌─────────────────────────────────────────────────────────────┐
│                    Vue Components (.vue)                    │
│            (Apresentação pura, ultra-finos, sem DB)          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Composables Presenters                      │
│        (useCollections, useEnvironments, useSettings)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Domain Services & Entities                │
│       (CollectionService, EnvironmentService, Settings)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Repository Interfaces (Domain Contracts)       │
│    ICollectionRepository, IEnvironmentRepository, etc.      │
└──────────────────────────────┬──────────────────────────────┘
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│     IndexedDB / Dexie       │     │       SQLite / Drizzle      │
│         (PWA/Web)           │     │          (Desktop)          │
│   src/core/storage/indexeddb│     │    src/core/storage/sqlite  │
└─────────────────────────────┘     └─────────────────────────────┘
```

### 9.2 Contratos de Persistência (Interfaces Agnósticas)

Localizados em `src/core/storage/interfaces.ts`:

- `ICollectionRepository`: `getAll()`, `getById(id)`, `save(collection)`, `delete(id)`.
- `IEnvironmentRepository`: `getAll()`, `getById(id)`, `save(environment)`, `delete(id)`.
- `ISettingsRepository`: `getSettings()`, `saveSettings(settings)`.
- `IRequestHistoryRepository`: `getAll(limit)`, `add(item)`, `clear()`.
- `IAppStateRepository`: `get<T>(key)`, `set<T>(key, value)`, `remove(key)`.
- `IPersistenceStorage`: container dos repositórios e método `initialize()`.

### 9.3 Factory e Inversão de Controle

- `createPersistenceStorage()` em `src/core/storage/storage.factory.ts`:
  - Detecta o runtime (ambiente web/PWA vs desktop).
  - Por padrão (Web/PWA), instancia `DexiePersistenceStorage`.
  - Quando a flag ou runtime desktop estiver ativo, instancia `SqlitePersistenceStorage`.
  - Isola 100% o Dexie e o Drizzle/SQLite dentro de `src/core/storage/`.

---

## 10. Riscos Mapeados e Estratégias de Mitigação

1. **Assincronia do IndexedDB vs Reatividade Síncrona do Vue:**
   - *Risco:* Composables esperarem estado síncrono inicial enquanto o IndexedDB carrega assincronamente.
   - *Mitigação:* Inicializar o storage no bootstrap da aplicação (`src/main.ts` ou `initializePersistence()`) e carregar os dados nas stores/composables mantendo valores padrão seguros enquanto o carregamento completa.
2. **Ambiente de Teste (JSDOM / Vitest) sem IndexedDB nativo:**
   - *Risco:* Falha de testes unitários que executam IndexedDB no Node.js/jsdom.
   - *Mitigação:* Utilizar `fake-indexeddb` ou mock tipado limpo nos testes de repositório, garantindo execução ultrarrápida e determinística sem quebrar os 211 testes existentes.
3. **Migração do `localStorage` legado:**
   - *Risco:* Sobrescrever dados novos com dados antigos ou corromper dados ao migrar.
   - *Mitigação:* Validação estrita via Zod antes da migração; migração executa apenas se o IndexedDB estiver virgem e o `localStorage` possuir payload válido.
4. **Segurança de Variáveis Secretas:**
   - *Risco:* Exposição de tokens e senhas de ambientes.
   - *Mitigação:* Armazenamento isolado no IndexedDB sem console logs ou vazamento em serializadores não controlados.
5. **Autosave e Concorrência:**
   - *Risco:* Escrita concorrente no IndexedDB a cada digitação de tecla no CodeMirror.
   - *Mitigação:* Debounce nas operações de atualização contínua e garantia de atomicidade no repositório.

---

## 11. Plano de Implementação em Fases

- **Fase 1 (Concluída):** Auditoria completa e elaboração do `PERSISTENCE-AUDIT.md`.
- **Fase 2:** Contratos de Domínio e Validações Zod (`src/core/storage/interfaces.ts`, `schemas.ts`).
- **Fase 3:** Implementação do Banco Dexie IndexedDB (`src/core/storage/indexeddb/`).
- **Fase 4:** Migração transparente de dados legados do `localStorage` (`src/core/storage/migrations/`).
- **Fase 5:** Integração dos Repositórios com os Serviços e Composables (`CollectionService`, `EnvironmentService`, `SettingsService`).
- **Fase 6:** Preparação da arquitetura e contratos para Adapter SQLite / Desktop.
- **Fase 7:** Suíte completa de testes unitários (TDD) com garantia de 100% de cobertura.
- **Fase 8:** Validação de Linter, TypeScript e Build com PWA.

