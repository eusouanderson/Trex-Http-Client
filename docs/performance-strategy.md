# Estratégia de Performance Engineering — Trex-Http-Client

Este documento descreve a arquitetura, os processos de medição, os limites de orçamento e as fases de proteção automatizada de desempenho do **Trex-Http-Client**.

---

## 1. Visão Geral e Objetivos

O pipeline de engenharia de performance tem como objetivo garantir que o Trex mantenha alta velocidade de carregamento, baixo consumo de dados e estabilidade visual ao longo do seu ciclo contínuo de desenvolvimento.

A estratégia cobre:
1. **Auditoria de Recursos e Bundle Size**: Medição automatizada do tamanho bruto e compactado (gzip) dos assets JavaScript, CSS, fontes e imagens gerados no build de produção.
2. **Prevenção de Regressões de Código**: Comparação automática dos artefatos da Pull Request com a linha de base versionada (`performance-baseline.json`).
3. **Auditoria de Laboratório com Lighthouse CI**: Verificação de Performance, Acessibilidade, Boas Práticas, SEO e Core Web Vitals (FCP, LCP, CLS) em preview local idêntico a produção.
4. **Relatórios no GitHub Actions**: Publicação dos resultados no *Step Summary* da execução e salvamento dos artefatos de auditoria para inspeção detalhada.

---

## 2. Linha de Base e Métricas Atuais

A linha de base foi coletada diretamente a partir do build de produção Vite (`VITE_BASE_URL=/Trex-Http-Client/`):

### Métricas de Bundle (Atuais)
- **JavaScript Inicial**: 859.86 kB (280.29 kB gzip)
- **JavaScript Total**: 859.99 kB (280.41 kB gzip)
- **CSS Total**: 42.40 kB (7.88 kB gzip)

### Métricas do Lighthouse CI
- **Performance**: 100 / 100
- **Acessibilidade**: 85 / 100
- **Boas Práticas**: 100 / 100
- **SEO**: 100 / 100
- **First Contentful Paint (FCP)**: 0.5 s
- **Largest Contentful Paint (LCP)**: 0.7 s
- **Cumulative Layout Shift (CLS)**: 0

> *Nota sobre INP*: O Interaction to Next Paint (INP) é uma métrica de dados de campo (RUM - Real User Monitoring) que reflete a responsividade durante interações reais do usuário. No ambiente sintético de laboratório (CI), medem-se proxy metrics como Total Blocking Time (TBT) e tempos de execução de scripts.

---

## 3. Arquitetura da Solução

Toda a lógica de auditoria de bundles foi concebida seguindo 100% os princípios de Programação Orientada a Objetos (OOP) e Injeção de Dependências:

- `scripts/performance/interfaces.ts`: Contratos e tipagens estritas sem uso de `any`.
- `scripts/performance/bundle-analyzer.service.ts`: Identifica categorias de recursos (`js-entry`, `js-chunk`, `css-entry`, `font`, `image`, `service-worker`), normaliza nomes canônicos ignorando hashes dinâmicos do Rollup (`index-[hash].js` -> `index.js`) e calcula tamanhos brutos e gzip.
- `scripts/performance/budget-validator.service.ts`: Compara a execução atual com `performance-baseline.json`, avalia limites de `performance-budget.json`, detecta aumentos percentuais anômalos e gera relatório em Markdown para o `$GITHUB_STEP_SUMMARY`.
- `scripts/performance/performance-orchestrator.service.ts`: Orquestrador com injeção de dependências (`IFileSystem`, `ICompressionService`).
- `scripts/performance/run-bundle-analysis.ts`: Ponto de entrada CLI para `pnpm run perf:bundle`.
- `.lighthouserc.json`: Configuração do Lighthouse CI executando 3 rodadas sobre o servidor de preview oficial (`vite preview --base /Trex-Http-Client/`).

---

## 4. Orçamento de Performance (`performance-budget.json`)

O arquivo `performance-budget.json` na raiz do repositório define os limites operacionais:

```json
{
  "mode": "warn",
  "limits": {
    "maxInitialJsRawBytes": 1050000,
    "maxInitialJsGzipBytes": 330000,
    "maxTotalJsRawBytes": 1100000,
    "maxTotalJsGzipBytes": 350000,
    "maxTotalCssRawBytes": 60000,
    "maxTotalCssGzipBytes": 15000,
    "maxAllowedGrowthPercent": 15
  }
}
```

### Regras de Avaliação
1. **Distinção entre Bruto e Gzip**: O orçamento avalia ambos de forma independente. O tamanho compactado (gzip) reflete o custo de transferência de rede; o tamanho bruto reflete o custo de parsing e compilação na thread principal.
2. **Crescimento Percentual**: Caso o JavaScript total aumente mais que `maxAllowedGrowthPercent` (15%) em relação à baseline sem justificativa, uma violação é registrada.
3. **Independência de Hash**: Mudanças de hash (`index-CF5AVw2r.js` para `index-X9zK2L1.js`) não são tratadas como novos assets e sim mapeadas para a mesma entidade lógica `index.js`.

---

## 5. Estratégia de Bloqueio em Fases

### Fase A — Observação (Atual)
- Configuração: `"mode": "warn"` no `performance-budget.json` e `"warn"` nas asserções do `.lighthouserc.json`.
- Comportamento: O pipeline de CI executa todas as auditorias, gera relatórios completos e exibe alertas no resumo do GitHub Actions, **sem bloquear** o merge de Pull Requests por flutuações ainda não calibradas.

### Fase B — Proteção Obrigatória
Quando a equipe desejar transformar os alertas em bloqueios obrigatórios de PR:
1. No `performance-budget.json`, altere `"mode": "warn"` para `"mode": "error"`.
2. No `.lighthouserc.json`, altere o nível das asserções de `"warn"` para `"error"` (ex: `"categories:performance": ["error", { "minScore": 0.90 }]`).
3. No GitHub:
   - Acesse **Settings** → **Branches** → **Branch protection rules**.
   - Em `main`, habilite **Require status checks to pass before merging**.
   - Selecione os checks: `CI/CD Pipeline / validate-and-release`.

---

## 6. Comandos e Uso Local

### Rodar Auditoria de Bundle
```bash
pnpm run build
pnpm run perf:bundle
```

### Rodar Auditoria do Lighthouse CI
```bash
pnpm run build
pnpm run perf:lighthouse
```

### Rodar Auditoria Completa
```bash
pnpm run perf:audit
```

### Forçar Modo de Bloqueio Localmente
```bash
PERF_MODE=error pnpm run perf:bundle
```

### Atualizar a Linha de Base
Quando novas features forem incorporadas legitimamente e o aumento de bundle for aprovado:
```bash
pnpm run build
pnpm run perf:bundle
cp dist/performance-report.json performance-baseline.json
```

