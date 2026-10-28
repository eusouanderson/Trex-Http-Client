# 🗺️ Roadmap de Features Futuras & Especificação Técnica — Trex HTTP Client

Este documento formaliza o planejamento, arquitetura técnica e especificação detalhada das próximas funcionalidades planejadas para o **Trex HTTP Client**. O objetivo é consolidar o Trex como um cliente HTTP offline-first completo, intuitivo e de alta performance, mantendo rigor arquitetural de 100% OOP, TDD com 100% de cobertura, zero `any` e total aderência às diretrizes do projeto.

---

## 1. Feature Principal: Histórico de Execuções (`features/history`)

### 1.1. Contexto e Motivação
Atualmente, as requisições executadas no `RequestBuilder` ou `CollectionRunner` não deixam rastros cronológicos acessíveis para reexecução rápida. Embora o repositório de persistência IndexedDB (`DexieHistoryRepository`), os contratos de interface (`IRequestHistoryRepository`) e o schema de validação em runtime (`requestHistoryItemSchema`) já estejam implementados e testados no módulo `src/core/storage/`, a camada de domínio e a interface gráfica ainda não foram conectadas.

A funcionalidade de **Histórico de Requisições** visa preencher essa lacuna, proporcionando ao usuário uma visão temporal de todas as chamadas HTTP efetuadas, com capacidade de pesquisa, inspeção e restauração imediata em novas abas.

### 1.2. Especificação Técnica e Escopo

#### A. Captura Automática Pós-Execução
- **Ponto de Interceptação:** Integração com o fluxo de envio em `use-request.ts` e `RequestRunnerService`.
- **Dados Capturados de forma Assíncrona:**
  - `id`: Identificador único (`crypto.randomUUID()`).
  - `url`: URL resolvida com variáveis de ambiente interpoladas.
  - `method`: Método HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, etc.).
  - `status`: Código de status HTTP retornado (ex: 200, 201, 400, 500).
  - `durationMs`: Tempo total de trânsito da requisição em milissegundos.
  - `timestamp`: Timestamp Unix em milissegundos do momento do disparo.
  - `headers`: Dicionário com os cabeçalhos enviados.
  - `body`: Conteúdo textual/JSON do corpo da requisição.
- **Persistência Não Bloqueante:** A gravação no IndexedDB (`history.add()`) ocorre em segundo plano, sem degradar a reatividade ou o tempo de renderização do `ResponseViewer`.

#### B. Interface na Barra Lateral (`AppLayout`)
- **Navegação Superior na Sidebar:** Alternador de abas temático no topo do painel esquerdo:
  - `Coleções` (Árvore de requisições organizadas em pastas).
  - `Histórico` (Linha do tempo cronológica das execuções).
- **Controle de Estado:** Persistência da aba selecionada (Coleções vs Histórico) para preservar a visualização ao recarregar a aplicação.

#### C. Componente `HistoryList` (`src/features/history/HistoryList/`)
- **Agrupamento Cronológico:** Exibição estruturada com separadores temporais inteligentes:
  - *Hoje*
  - *Ontem*
  - *Esta Semana*
  - *Anteriores*
- **Badges Semânticos Temáticos:**
  - Método HTTP colorido de acordo com a paleta do Trex:
    - `GET`: Verde Dino (`text-dino-400 bg-dino-500/10 border-dino-500/30`)
    - `POST`: Âmbar Fóssil (`text-amber-400 bg-amber-500/10 border-amber-500/30`)
    - `PUT` / `PATCH`: Azul / Ciano
    - `DELETE`: Magma Vulcânico (`text-magma-400 bg-magma-500/10 border-magma-500/30`)
  - Status code HTTP com cores indicativas (2xx Sucesso, 3xx Redirecionamento, 4xx Erro de Cliente, 5xx Erro de Servidor).
- **Filtros e Busca em Tempo Real:**
  - Campo de pesquisa rápida por URL e parâmetros.
  - Filtro por método HTTP via botões compactos ou menu dropdown.
- **Interatividade & Restauração:**
  - Clique simples em um item do histórico: abre automaticamente a requisição em uma nova aba do `AppLayout` com método, URL, headers e body exatamente como foram executados.
- **Gestão e Limpeza:**
  - Botão de exclusão individual por item (hover com ícone de lixeira).
  - Botão de ação global "Limpar Histórico" com diálogo de confirmação.

#### D. Padrões de Engenharia & Arquitetura (OOP + SOLID)
- **Estrutura de Diretórios:**
  ```text
  src/features/history/
  ├── tests/
  │   ├── history.service.spec.ts
  │   ├── history.entity.spec.ts
  │   └── use-history.spec.ts
  ├── HistoryList/
  │   ├── tests/
  │   │   ├── HistoryList.spec.ts
  │   │   └── use-history-list.spec.ts
  │   ├── index.vue                   # Apenas template e classes Tailwind
  │   ├── use-history-list.ts         # Adaptador reativo do componente
  │   └── interfaces.ts               # Tipagens e props visuais
  ├── interfaces.ts                   # Contratos de domínio e DTOs
  ├── history.service.ts              # Classe OOP com regras de negócio e limites
  ├── history.repository.ts           # Classe OOP encapsulando IRequestHistoryRepository
  ├── history.entity.ts               # Classe rica de domínio
  ├── use-history.ts                  # Composable adaptador reativo (Presenter)
  └── index.ts                        # Public API do módulo
  ```
- **Conformidade Estrita:**
  - Arrow functions obrigatórias e exportações agrupadas ao final.
  - 100% de cobertura de testes unitários com Vitest.
  - Zero `any` e zero comentários em código.

---

## 2. Features Alternativas de Alto Valor

### 2.1. Opção 2: Gerador de Snippets de Código (`Code Generator`)
- **Objetivo:** Permitir ao desenvolvedor extrair instantaneamente o comando equivalente da requisição ativa para colar diretamente em projetos externos, scripts ou no terminal.
- **Alvos de Exportação Suportados:**
  1. `cURL` (formato padrão com quebra de linha `\`, headers `-H` e payload `-d`).
  2. `JavaScript Fetch` (API padrão de navegadores e Node.js 18+).
  3. `Axios` (código TypeScript/JavaScript para aplicações front-end e back-end).
  4. `Python Requests` (snippet idiomático com `import requests`).
  5. `Node.js Native HTTP` / `Got`.
  6. `PHP (cURL / Guzzle)`.
  7. `Go (net/http)`.
- **Interface:**
  - Botão discreto `</>` ("Gerar Código") na barra de ações da requisição com tooltip de atalho.
  - Modal com seletor de linguagem, realce de sintaxe via CodeMirror (somente-leitura) e botão de cópia com feedback visual ("Copiado!").

### 2.2. Opção 3: Importador Rápido de cURL (`Paste as cURL`)
- **Objetivo:** Agilizar a criação de requisições a partir de chamadas copiadas da aba *Network* das Ferramentas de Desenvolvedor do navegador ou de documentações de API externas.
- **Capacidades do Parser:**
  - Detecção inteligente do método HTTP (`-X POST`, `--request GET`, etc.).
  - Extração de cabeçalhos (`-H "Header: Value"` ou `--header "..."`).
  - Extração e formatação de query params da URL.
  - Extração de payload JSON ou form-data (`-d`, `--data`, `--data-raw`, `--data-binary`).
  - Suporte a autenticação Basic e Bearer passadas via flag `-u` ou `-H "Authorization: ..."`.
- **Interface:**
  - Suporte a colar diretamente na barra de URL (se o texto iniciar com `curl `).
  - Modal dedicado acessível via Command Palette (`Importar comando cURL`) ou atalho de teclado `Ctrl + Shift + I`.

### 2.3. Opção 4: Visualizador de Resposta Visual / Multimídia (`Visual Response Preview`)
- **Objetivo:** Expandir o `ResponseViewer` além de JSON estruturado, viabilizando a inspeção de respostas ricas retornadas por APIs e servidores Web.
- **Tipos de Conteúdo Suportados:**
  1. `text/html`: Visualização renderizada em `iframe` com atributo `sandbox="allow-same-origin"` isolado, permitindo validar páginas de erro amigáveis, autenticação e documentações.
  2. `image/*` (PNG, JPEG, WebP, GIF, SVG): Exibição visual da imagem retornada com dimensões, canal alfa e botão para download.
  3. `application/pdf`: Visualizador embutido para relatórios gerados por endpoints.
  4. `text/plain` / `text/csv` / `text/xml`: Visualizador de texto cru e formatação XML.
- **Interface:**
  - Sub-abas automáticas no topo do `ResponseViewer`: `Pretty JSON` (padrão quando aplicável), `Preview Visual`, `Raw` e `Headers`.

## 2.4. Opção 5: Criar nossos próprios endpoints
- **Objetivo:** No mommento utilizamos o endpoint de terceiros(jsonplaceholder), para servir como exemplo ao usuário que inicia seu uso no Trex HTTP Client, demonstrando funcionalidades básicas, mas planejamos criar nossos próprios endpoints para maior controle e personalização das respostas.
- **Benefícios Esperados:**
  - Controle total sobre os dados retornados e formatos de resposta.
  - Possibilidade de implementar autenticação e autorização customizadas.
  - POST, GET, PUT, DELETE personalizados com dados do Trex HTTP Client.
  - Possibilidade de testar todos os cenarios de Auth disponíveis no Trex HTTP Client.
  - Flexibilidade para simular diferentes respostas de erro e sucesso para cada endpoint.

**Observação:** A implementação deste endpoint próprio permitirá maior flexibilidade e controle sobre os dados utilizados nas requisições do Trex HTTP Client.
**Status:** Planejado
---

## 3. Matriz de Priorização & Roadmap

| Fase | Funcionalidade | Domínio | Complexidade | Valor para o Usuário | Status |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Fase 1** | **Histórico de Requisições** | `src/features/history` | Média | 🔥 Alto | Especificado / Próximo |
| **Fase 2** | **Gerador de Snippets de Código** | `src/features/request/CodeGen` | Baixa-Média | 🚀 Alto | Planejado |
| **Fase 3** | **Importador "Paste as cURL"** | `src/features/request/CurlImporter` | Média | ⚡ Alto | Planejado |
| **Fase 4** | **Preview Visual de Respostas** | `src/features/response/VisualPreview` | Média | 🎯 Médio-Alto | Planejado |

---

## 4. Requisitos de Qualidade e Governança

Todas as implementações decorrentes deste roadmap devem cumprir rigorosamente:

1. **Princípios SOLID e 100% OOP:** Lógica e manipulação de dados modeladas exclusivamente em Classes orientadas a objetos, com injeção de dependência via construtor.
2. **Componentes Vue Ultrafinos:** Arquivos `.vue` restritos a template e CSS Tailwind, delegando todo o estado e comportamento a composables dedicados.
3. **Desenvolvimento Orientado a Testes (TDD):** Testes unitários implementados previamente na pasta `tests/` de cada domínio.
4. **Cobertura Integral (100%):** Nenhuma alteração pode reduzir a métrica de 100% em Statements, Branches, Functions e Lines do Vitest.
5. **TypeScript Estrito:** Proibição de `any`, com todas as tipagens declaradas em arquivos `interfaces.ts` dedicados.
6. **Código Limpo:** Ausência completa de comentários ou explicações de código (JSDoc, inline, cabeçalhos).

