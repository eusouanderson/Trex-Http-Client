# ARCHITECTURE.md — Arquitetura do Sistema Trex-Http-Client

## 1. Visão Geral

O `Trex-Http-Client` adota uma arquitetura inspirada em **Feature-Sliced Design** e **Domain-Driven Design**, combinada com uma estratégia de **co-localização** de artefatos por domínio e **isolamento de testes em pastas dedicadas** (`tests/`).

A estrutura resolve os gargalos de acoplamento excessivo entre UI e regras de negócio, vazamento de consultas a banco de dados em componentes e dificuldade de manutenção e testes.

---

## 2. Estrutura de Diretórios do Projeto

```text
meu-http-client/
├── ../AGENTS.md                  # Fonte de verdade para IAs e agentes
├── ARCHITECTURE.md            # Documentação viva de decisões arquiteturais
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.js
├── tailwind.config.js
├── postcss.config.js
│
├── e2e/                       # Testes end-to-end (Playwright) isolados da aplicação
│
└── src/
    ├── app/                   # Configuração global da aplicação
    │   ├── router/
    │   │   └── tests/
    │   ├── providers/
    │   └── stores/
    │       └── tests/
    │
    ├── core/                  # Regras puras e infraestrutura técnica (Agnóstico de UI/Vue)
    │   ├── http/
    │   │   └── tests/
    │   ├── storage/
    │   │   ├── migrations/
    │   │   └── tests/
    │   ├── variables/
    │   │   └── tests/
    │   ├── formatting/
    │   │   └── tests/
    │   ├── security/
    │   │   └── tests/
    │   └── scripts/
    │       └── tests/
    │
    ├── features/              # Domínios da aplicação (Alta coesão)
    │   ├── request/
    │   │   ├── tests/
    │   │   ├── RequestBuilder/
    │   │   │   └── tests/
    │   │   └── HeadersEditor/
    │   │       └── tests/
    │   │
    │   ├── response/
    │   │   ├── tests/
    │   │   └── ResponseViewer/
    │   │       └── tests/
    │   │
    │   ├── collections/
    │   │   ├── tests/
    │   │   └── CollectionTree/
    │   │       └── tests/
    │   │
    │   ├── environments/
    │   │   ├── tests/
    │   │   └── EnvironmentSelector/
    │   │       └── tests/
    │   │
    │   └── history/
    │       ├── tests/
    │       └── HistoryList/
    │           └── tests/
    │
    ├── shared/                # Recursos reaproveitáveis (Design System, utilitários)
    │   ├── ui/
    │   │   ├── Button/
    │   │   │   └── tests/
    │   │   └── SplitPanel/
    │   │       └── tests/
    │   ├── editor/
    │   │   └── CodeEditor/
    │   │       └── tests/
    │   └── types/
    │
    ├── layouts/               # Estruturas de layout da página
    │   └── AppLayout/
    │       └── tests/
    │
    ├── pages/                 # Composição final de Features e Layouts
    │   └── HttpClientPage/
    │       └── tests/
    │
    └── assets/                # Design tokens e estilos
        └── styles/
```

---

## 3. Diretrizes de Desenvolvimento e Testes

1. **Pasta de Testes por Domínio**: Cada domínio, subdomínio e componente possui sua própria pasta `tests/` para abrigar arquivos de teste unitário e de integração (`*.spec.ts`).
2. **Co-localização**: Componentes residem em suas próprias pastas dedicadas com `index.vue`, `use-*.ts` e subpasta `tests/`.
3. **Agnosticismo do Core**: O diretório `src/core/` não deve conter importações ou acoplamentos com o Vue ou Pinia.
4. **Public API**: Cada pasta dentro de `src/features/` exporta suas capacidades através de um arquivo `index.ts`.
