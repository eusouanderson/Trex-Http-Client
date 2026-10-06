---
name: project-architecture
description: Impõe as regras da arquitetura Feature-Sliced e Domain-Driven com co-localização e pasta de testes em cada domínio para o projeto Trex-Http-Client. Use sempre que for criar, organizar ou refatorar arquivos, componentes, stores, serviços ou testes.
---

# Project Architecture Skill — Trex-Http-Client

## Objetivo
Esta skill assegura que qualquer alteração de código ou criação de nova funcionalidade no projeto `Trex-Http-Client` respeite a separação de responsabilidades em camadas, o padrão de co-localização por domínio e o isolamento dos arquivos de teste em pastas dedicadas `tests/` dentro de cada domínio ou componente.

---

## 1. Classificação de Diretórios

Antes de criar qualquer arquivo, identifique a camada correta:

| Camada | Propósito | Regras e Restrições |
| :--- | :--- | :--- |
| `src/app/` | Bootstrap, roteamento e stores globais | Apenas orquestração geral. Testes em `router/tests/` e `stores/tests/`. |
| `src/core/` | Infraestrutura técnica pura e agnóstica | **Zero Vue / Zero UI**. Testes em `core/<modulo>/tests/`. |
| `src/features/` | Domínios de negócio (`request`, `response`, `collections`, `environments`, `history`) | Alta coesão. Cada domínio e componente possui subpasta `tests/`. Public API no `index.ts`. |
| `src/shared/` | Componentes burros e utilitários genéricos | Componentes de UI e editor contêm sua própria pasta `tests/`. |
| `src/layouts/` | Cascas visuais | Componentes estruturais de layout (`AppLayout/tests/`). |
| `src/pages/` | Páginas e rotas finais | Conecta rotas aos layouts e features (`HttpClientPage/tests/`). |
| `e2e/` | Testes ponta a ponta | Testes isolados com Playwright fora de `src/`. |

---

## 2. Regra Estrita de Co-localização com Subpasta `tests/`

Dentro de cada domínio ou componente, **os testes devem residir obrigatoriamente em uma subpasta `tests/`**:

```text
features/request/
├── tests/
│   ├── request.service.spec.ts
│   └── request.store.spec.ts
├── RequestBuilder/
│   ├── tests/
│   │   ├── RequestBuilder.spec.ts
│   │   └── use-request-builder.spec.ts
│   ├── index.vue
│   └── use-request-builder.ts
├── HeadersEditor/
│   ├── tests/
│   │   └── HeadersEditor.spec.ts
│   └── index.vue
├── request.service.ts
├── request.store.ts
├── request.types.ts
└── index.ts
```

---

## 3. Isolamento do Core

- Os arquivos sob `src/core/` devem utilizar TypeScript puro.
- **Nunca importe** `ref`, `reactive`, `computed`, `defineComponent` ou qualquer dependência do Vue ou Pinia dentro de `src/core/`.
- Todos os clientes externos (rede, banco de dados, criptografia) devem ser abstraídos por interfaces, e seus testes unitários ficam em seus respectivos `core/<modulo>/tests/`.

---

## 4. Regras de Código

1. **Sem comentários**: Nunca inclua comentários inline, JSDoc ou cabeçalhos explicativos.
2. **Sem any**: Sempre forneça tipagens explícitas através de `interface` ou `type`.
3. **Template em kebab-case**: Use `<request-builder />` e não `<RequestBuilder />` no template.
4. **Script setup**: Use sempre `<script setup lang="ts">`.
5. **Local dos testes**: Testes unitários e de integração sempre dentro da subpasta `tests/` do respectivo módulo/componente.
