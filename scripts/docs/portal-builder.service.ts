import type {
  GuideItem,
  IBundleMetricsSummary,
  ILighthouseReportSummary,
  IPortalBuilderService,
  IPullRequestDocItem,
  IVersionDiffComparison,
  IVersionMetricsHistoryItem,
  PortalBuilderOptions,
} from './interfaces';

class PortalBuilderService implements IPortalBuilderService {
  public buildPortalHtml = (options: PortalBuilderOptions): string => {
    const { title, version, commitHash, contextOutput, apiDocsPath, guides } = options;
    const apiBaseDir = apiDocsPath.endsWith('index.html')
      ? apiDocsPath.replace(/index\.html$/, '')
      : (apiDocsPath.endsWith('/') ? apiDocsPath : `${apiDocsPath}/`);

    const architectureItemsHtml = contextOutput.architectureHighlights
      .map((item) => `<li class="flex items-start gap-2"><span class="text-dino-accent font-bold">›</span><span>${this.escapeHtml(item)}</span></li>`)
      .join('\n');

    const changelogItemsHtml = contextOutput.changelogHighlights
      .map((item) => `<li class="flex items-start gap-2"><span class="text-amber-accent font-bold">›</span><span>${this.escapeHtml(this.cleanMarkdownText(item))}</span></li>`)
      .join('\n');

    const guidesCardsHtml = guides
      .map((g) => `
        <a href="./guides/${this.escapeHtml(g.fileName)}.html" class="guide-card">
          <div class="text-xs uppercase tracking-wider text-dino-accent font-semibold mb-1">Guia Técnico</div>
          <h3 class="text-lg font-bold text-bone-main mb-2">${this.escapeHtml(g.title)}</h3>
          <p class="text-sm text-bone-muted">${this.escapeHtml(g.description)}</p>
          <div class="mt-4 text-xs font-semibold text-dino-accent inline-flex items-center gap-1">
            Ler guia completo <span>→</span>
          </div>
        </a>
      `)
      .join('\n');

    const performanceSectionHtml = this.buildPerformanceSection(
      options.lighthouseMetrics,
      options.bundleMetrics,
      options.previousComparison,
    );

    const releasesSectionHtml = this.buildReleasesSection(
      options.pullRequests ?? [],
      options.versionHistory ?? [],
      version,
    );

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="${this.escapeHtml(options.baseUrl)}">
  <title>${this.escapeHtml(title)}</title>
  <meta name="description" content="Documentação técnica, arquitetura e referência da API do Trex-Http-Client.">
  <link rel="icon" type="image/png" href="../logos/Trex.png">
  <style>
    :root {
      --bg-ground: #100f0d;
      --bg-panel: #171613;
      --bg-card: #201e19;
      --border: #332f27;
      --border-focus: #15803d;
      --text-main: #f5f3ef;
      --text-muted: #a8a29e;
      --dino-accent: #22c55e;
      --amber-accent: #f59e0b;
      --magma-accent: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-ground);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    header {
      background: rgba(23, 22, 19, 0.85);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .brand img { width: 32px; height: 32px; border-radius: 6px; }
    .badge {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
      border: 1px solid var(--border);
    }
    .badge-dino { background: rgba(34, 197, 94, 0.12); color: var(--dino-accent); border-color: rgba(34, 197, 94, 0.3); }
    .badge-amber { background: rgba(245, 158, 11, 0.12); color: var(--amber-accent); border-color: rgba(245, 158, 11, 0.3); }
    .badge-magma { background: rgba(239, 68, 68, 0.12); color: var(--magma-accent); border-color: rgba(239, 68, 68, 0.3); }
    .nav-links { display: flex; align-items: center; gap: 1.5rem; font-size: 0.9rem; font-weight: 500; }
    .nav-links a:hover { color: var(--dino-accent); }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary { background: var(--dino-accent); color: #052e16; }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-main); }
    .btn-secondary:hover { border-color: var(--dino-accent); }
    .hero {
      padding: 4.5rem 0 3.5rem;
      border-bottom: 1px solid var(--border);
      background: radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.08), transparent 70%);
      text-align: center;
    }
    .hero h1 {
      font-size: 2.75rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 1.25rem;
    }
    .hero p {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 680px;
      margin: 0 auto 2rem;
    }
    .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .section-subtitle { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.75rem; }
    .grid { display: grid; gap: 1.25rem; }
    .grid-cols-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .card {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover { border-color: rgba(34, 197, 94, 0.4); }
    .guide-card {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }
    .guide-card:hover {
      border-color: var(--dino-accent);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -8px rgba(34, 197, 94, 0.15);
    }
    .ai-banner {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(245, 158, 11, 0.04));
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2.5rem 0;
    }
    .code-pill {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.8rem;
      background: #000;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: 1px solid var(--border);
      color: var(--dino-accent);
    }
    .score-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      padding: 0.75rem 0.5rem;
      background: var(--bg-ground);
      border-radius: 8px;
      border: 1px solid var(--border);
      text-align: center;
    }
    .score-value { font-size: 1.75rem; font-weight: 900; line-height: 1; margin-bottom: 0.35rem; }
    .score-label { font-size: 0.75rem; color: var(--text-muted); }
    .diff-badge { font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.35rem; border-radius: 4px; margin-top: 0.25rem; }
    .diff-pos { background: rgba(34, 197, 94, 0.15); color: var(--dino-accent); }
    .diff-neg { background: rgba(239, 68, 68, 0.15); color: var(--magma-accent); }
    .diff-neutral { background: rgba(168, 162, 158, 0.15); color: var(--text-muted); }
    .pr-item {
      padding: 1rem;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: border-color 0.15s ease;
    }
    .pr-item:hover { border-color: var(--dino-accent); }
    footer {
      border-top: 1px solid var(--border);
      padding: 3rem 0;
      margin-top: 5rem;
      color: var(--text-muted);
      font-size: 0.875rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <div class="container nav-inner">
      <div class="brand">
        <img src="../logos/Trex.png" alt="Trex HTTP Client">
        <span>Trex Docs</span>
        <span class="badge badge-dino">v${this.escapeHtml(version)}</span>
      </div>
      <nav class="nav-links">
        <a href="#modulos">Módulos</a>
        <a href="#performance">Lighthouse & Performance</a>
        <a href="#releases">Releases & PRs</a>
        <a href="#guias">Guias</a>
        <a href="#arquitetura">Arquitetura</a>
        <a href="${this.escapeHtml(apiDocsPath)}">API TypeDoc</a>
        <a href="/Trex-Http-Client/" class="btn btn-primary">Abrir Trex App</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div style="display:inline-flex; align-items:center; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; justify-content:center;">
          <span class="badge badge-amber">Commit: ${this.escapeHtml(commitHash)}</span>
          <span class="badge badge-dino">v${this.escapeHtml(version)}</span>
          <span class="badge badge-dino">100% OOP & Strict TypeScript</span>
        </div>
        <h1>Documentação Técnica Inteligente</h1>
        <p>Referência técnica de API, arquitetura Feature-Sliced / DDD, contratos, métricas Lighthouse e guias operacionais do Trex HTTP Client.</p>
        <div class="hero-actions">
          <a href="${this.escapeHtml(apiDocsPath)}" class="btn btn-primary">
            Explorar Referência da API (TypeDoc) ↗
          </a>
          <a href="#performance" class="btn btn-secondary">
            Métricas de Qualidade & CI ↓
          </a>
          <a href="#releases" class="btn btn-secondary">
            Histórico de Releases & PRs ↓
          </a>
          <a href="../../Trex-Http-Client/" class="btn btn-secondary">
            Acessar Aplicação Web
          </a>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="ai-banner">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.25rem;">🦖</span>
            <span style="font-weight:700; font-size:1.05rem;">Resumo Contextual da Versão</span>
          </div>
          <span class="badge badge-dino">${this.renderModelBadge(contextOutput.modelUsed)}</span>
        </div>
        <p style="color:var(--text-main); font-size:1rem; margin-bottom:1.25rem;">${this.escapeHtml(contextOutput.summary)}</p>
        <div class="grid grid-cols-2">
          <div>
            <div style="font-weight:700; font-size:0.875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--dino-accent); margin-bottom:0.5rem;">Destaques Arquiteturais</div>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9rem;">
              ${architectureItemsHtml}
            </ul>
          </div>
          <div>
            <div style="font-weight:700; font-size:0.875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--amber-accent); margin-bottom:0.5rem;">Alterações Recentes</div>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9rem;">
              ${changelogItemsHtml}
            </ul>
          </div>
        </div>
      </div>

      <section id="modulos" style="margin-top:3rem;">
        <h2 class="section-title">Módulos Centrais do Trex</h2>
        <p class="section-subtitle">Arquitetura estritamente desacoplada entre regras puras agnósticas (core) e componentes de domínio (features).</p>
        <div class="grid grid-cols-3">
          <div class="card">
            <span class="code-pill">src/core/http</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Core HTTP Client</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Cliente HTTP resiliente com suporte a timeouts, cancelamento com AbortController, interceptors, retries idempotentes com backoff exponencial e validação Zod.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/core_http.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/security</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Segurança & Segredos</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Provedores OOP de autenticação (OAuth2 com PKCE S256, Bearer, Basic Auth, ApiKey) e SecretsMaskerService para mascaramento automático de credenciais.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/core_security.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/variables</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Variáveis & Interpolação</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">VariableResolverService com resolução hierárquica, interpolação em cascata ({{variavel}}) e prevenção ativa contra dependências cíclicas.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/core_variables.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/scripts</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Scripts de Teste (tx / pm)</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Sandbox seguro para execução de asserções em JavaScript pós-resposta, com compatibilidade Postman (pm) e namespace nativo Trex (tx).</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/core_scripts.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/storage</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Persistência Multi-Target</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Abstração agnóstica de banco de dados com Dexie / IndexedDB no PWA, suporte a migrações idempotentes e fallback transparente em memória.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/core_storage.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/features/collections</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Coleções & Runner</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Árvore hierárquica com drag-and-drop, exportação JSON, menu de contexto e CollectionRunnerService para execução em lote de requisições.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/features_collections.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/features/environments</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Ambientes & Variáveis</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Gerenciamento de variáveis em múltiplos escopos, resolução dinâmica de segredos e EnvironmentService orientado a objetos.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/features_environments.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/features/request</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Request Builder & Auth</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Construtor modular de requisições, headers, query params, editores de autorização e execução com RequestRunnerService.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/features_request.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/features/settings</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Configurações & Temas</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Gerenciamento de timeouts, retries, densidade compacta/confortável, painéis separados e temas dinâmicos via SettingsService.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiBaseDir)}modules/features_settings.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>
        </div>
      </section>

      ${performanceSectionHtml}

      ${releasesSectionHtml}

      <section id="guias" style="margin-top:4rem;">
        <h2 class="section-title">Guias Práticos & Manuais</h2>
        <p class="section-subtitle">Instruções passo a passo sobre os fluxos operacionais e recursos avançados do Trex-Http-Client.</p>
        <div class="grid grid-cols-2">
          ${guidesCardsHtml}
        </div>
      </section>

      <section id="arquitetura" style="margin-top:4rem;">
        <h2 class="section-title">Diretrizes de Arquitetura</h2>
        <p class="section-subtitle">Padrões rígidos estabelecidos para manutenção de longo prazo e 100% de cobertura de testes.</p>
        <div class="card">
          <ul style="list-style:none; display:flex; flex-direction:column; gap:1rem; font-size:0.95rem;">
            <li class="flex items-start gap-3">
              <span class="text-dino-accent font-bold" style="color:var(--dino-accent);">✓</span>
              <div>
                <strong>100% Orientado a Objetos (OOP):</strong> Toda lógica de negócio, infraestrutura, serviços e entidades são modeladas como Classes com injeção de dependência.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-dino-accent font-bold" style="color:var(--dino-accent);">✓</span>
              <div>
                <strong>Composables como Adaptadores Reativos:</strong> Os composables do Vue atuam exclusivamente como pontes entre os estados reativos da UI e os serviços OOP.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-dino-accent font-bold" style="color:var(--dino-accent);">✓</span>
              <div>
                <strong>TypeScript Estrito sem Any:</strong> Todos os tipos e contratos declarados formalmente em interfaces isoladas por domínio.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-dino-accent font-bold" style="color:var(--dino-accent);">✓</span>
              <div>
                <strong>100% de Cobertura de Testes:</strong> TDD como metodologia com garantia estrita de cobertura total em Statements, Branches, Functions e Lines.
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </main>

  <footer>
    <div class="container">
      <p style="margin-bottom:0.5rem;"><strong>Trex HTTP Client</strong> — Criado por Anderson Rodrigues da Silva</p>
      <p style="color:var(--text-muted); font-size:0.8rem;">Contribuidores: Lucas Jorge Rosa Silva & Marcos Roberto de Sousa Kimura • Licença MIT</p>
      <p style="color:#666; font-size:0.75rem; margin-top:0.75rem;">Documentação gerada automaticamente via TypeDoc e Groq AI no pipeline do GitHub Actions.</p>
    </div>
  </footer>
</body>
</html>`;
  };

  private buildPerformanceSection = (
    lighthouse?: ILighthouseReportSummary,
    bundle?: IBundleMetricsSummary,
    comparison?: IVersionDiffComparison,
  ): string => {
    const pScore = lighthouse?.scores.performance !== null && lighthouse?.scores.performance !== undefined ? lighthouse.scores.performance.toString() : 'N/A';
    const aScore = lighthouse?.scores.accessibility !== null && lighthouse?.scores.accessibility !== undefined ? lighthouse.scores.accessibility.toString() : 'N/A';
    const bpScore = lighthouse?.scores.bestPractices !== null && lighthouse?.scores.bestPractices !== undefined ? lighthouse.scores.bestPractices.toString() : 'N/A';
    const seoScore = lighthouse?.scores.seo !== null && lighthouse?.scores.seo !== undefined ? lighthouse.scores.seo.toString() : 'N/A';

    const renderDiff = (diff: number | null | undefined): string => {
      if (diff === null || diff === undefined) {
        return '';
      }
      if (diff > 0) {
        return `<span class="diff-badge diff-pos">+${diff.toString()}</span>`;
      }
      if (diff < 0) {
        return `<span class="diff-badge diff-neg">${diff.toString()}</span>`;
      }
      return `<span class="diff-badge diff-neutral">0</span>`;
    };

    const isPending = lighthouse?.status === 'pending';
    const isUnavailable = !lighthouse || lighthouse.status === 'unavailable';

    const bannerHtml = isPending || isUnavailable
      ? `
        <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.3); border-radius:8px; padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; color:var(--amber-accent);">
          <strong>Status da Auditoria:</strong> ${isPending ? 'Pendente' : 'Não executada'} — ${this.escapeHtml(lighthouse?.errorMessage ?? 'Aguardando execução do pipeline Lighthouse CI.')}
        </div>
      `
      : '';

    const fcpText = lighthouse?.metrics.fcpFormatted ?? (lighthouse?.metrics.fcpMs !== null && lighthouse?.metrics.fcpMs !== undefined ? `${(lighthouse.metrics.fcpMs / 1000).toFixed(2)} s` : 'N/A');
    const lcpText = lighthouse?.metrics.lcpFormatted ?? (lighthouse?.metrics.lcpMs !== null && lighthouse?.metrics.lcpMs !== undefined ? `${(lighthouse.metrics.lcpMs / 1000).toFixed(2)} s` : 'N/A');
    const clsText = lighthouse?.metrics.clsFormatted ?? (lighthouse?.metrics.clsScore !== null && lighthouse?.metrics.clsScore !== undefined ? lighthouse.metrics.clsScore.toString() : 'N/A');

    const bundleJsGzipKb = bundle && bundle.initialJsGzipBytes > 0 ? (bundle.initialJsGzipBytes / 1024).toFixed(1) : 'N/A';
    const bundleJsLimitKb = bundle && bundle.maxInitialJsGzipLimit > 0 ? (bundle.maxInitialJsGzipLimit / 1024).toFixed(1) : '322.3';
    const isRespected = bundle?.isBudgetRespected === true;
    const budgetStatusText = isRespected ? 'Orçamento Respeitado' : 'Verificação Pendente';
    const budgetStatusClass = isRespected ? 'text-dino-accent' : 'text-amber-accent';

    const previousVersionText = typeof comparison?.previousVersion === 'string' && comparison.previousVersion.length > 0
      ? ` (vs v${this.escapeHtml(comparison.previousVersion)})`
      : '';

    const auditedDateText = typeof lighthouse?.auditedAt === 'string' && lighthouse.auditedAt.length > 0
      ? `<span style="font-size:0.75rem; color:var(--text-muted);">${new Date(lighthouse.auditedAt).toLocaleDateString('pt-BR')}</span>`
      : '';

    return `
      <section id="performance" style="margin-top:4rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
          <div>
            <h2 class="section-title">Engenharia de Performance & Lighthouse CI</h2>
            <p class="section-subtitle" style="margin-bottom:0;">Auditoria automatizada das métricas de laboratório e orçamento de bundle a cada release oficial.</p>
          </div>
          <a href="./guides/performance-strategy-guide.html" style="color:var(--dino-accent); font-weight:700; font-size:0.9rem;">
            Ver Estratégia de Performance Completa →
          </a>
        </div>

        ${bannerHtml}

        <div class="grid grid-cols-2" style="margin-bottom:1.25rem;">
          <div class="card" style="border-left:4px solid var(--dino-accent);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
              <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted);">Índices de Auditoria Lighthouse${previousVersionText}</span>
              ${auditedDateText}
            </div>
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
              <div class="score-box">
                <span class="score-value" style="color:var(--dino-accent);">${this.escapeHtml(pScore)}</span>
                <span class="score-label">Performance</span>
                ${renderDiff(comparison?.performanceDiff)}
              </div>
              <div class="score-box">
                <span class="score-value" style="color:var(--dino-accent);">${this.escapeHtml(aScore)}</span>
                <span class="score-label">Acessibilidade</span>
                ${renderDiff(comparison?.accessibilityDiff)}
              </div>
              <div class="score-box">
                <span class="score-value" style="color:var(--dino-accent);">${this.escapeHtml(bpScore)}</span>
                <span class="score-label">Boas Práticas</span>
                ${renderDiff(comparison?.bestPracticesDiff)}
              </div>
              <div class="score-box">
                <span class="score-value" style="color:var(--dino-accent);">${this.escapeHtml(seoScore)}</span>
                <span class="score-label">SEO</span>
                ${renderDiff(comparison?.seoDiff)}
              </div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.75rem;">
              Metas de referência: 100 pontos em cada categoria. Resultados medidos em laboratório com preset Desktop.
            </div>
          </div>

          <div class="card" style="border-left:4px solid var(--amber-accent);">
            <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:0.75rem;">Métricas de Laboratório & Orçamento de Bundle</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div style="padding:0.6rem; background:var(--bg-ground); border-radius:8px; border:1px solid var(--border);">
                <div style="font-size:0.7rem; color:var(--text-muted);">First Contentful Paint (FCP)</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--dino-accent);">${this.escapeHtml(fcpText)} <span style="font-size:0.7rem; font-weight:normal; color:var(--text-muted);">(Meta: &le; 0.5s)</span></div>
              </div>
              <div style="padding:0.6rem; background:var(--bg-ground); border-radius:8px; border:1px solid var(--border);">
                <div style="font-size:0.7rem; color:var(--text-muted);">Largest Contentful Paint (LCP)</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--dino-accent);">${this.escapeHtml(lcpText)} <span style="font-size:0.7rem; font-weight:normal; color:var(--text-muted);">(Meta: &lt; 2.5s)</span></div>
              </div>
              <div style="padding:0.6rem; background:var(--bg-ground); border-radius:8px; border:1px solid var(--border);">
                <div style="font-size:0.7rem; color:var(--text-muted);">Cumulative Layout Shift (CLS)</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--dino-accent);">${this.escapeHtml(clsText)} <span style="font-size:0.7rem; font-weight:normal; color:var(--text-muted);">(Meta: 0)</span></div>
              </div>
              <div style="padding:0.6rem; background:var(--bg-ground); border-radius:8px; border:1px solid var(--border);">
                <div style="font-size:0.7rem; color:var(--text-muted);">JS Inicial Gzip / Limite</div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--dino-accent);">${this.escapeHtml(bundleJsGzipKb)} kB <span style="font-size:0.7rem; font-weight:normal; color:var(--text-muted);">/ ${this.escapeHtml(bundleJsLimitKb)} kB</span></div>
                <div style="font-size:0.75rem; font-weight:700; margin-top:0.25rem;" class="${budgetStatusClass}">${this.escapeHtml(budgetStatusText)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  private buildReleasesSection = (
    pullRequests: IPullRequestDocItem[],
    versionHistory: IVersionMetricsHistoryItem[],
    currentVersion: string,
  ): string => {
    const recentPrs = [...pullRequests].reverse().slice(0, 10);
    const prsHtml = recentPrs.length > 0
      ? recentPrs
          .map((pr) => `
            <div class="pr-item">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <a href="${this.escapeHtml(pr.url)}" target="_blank" rel="noopener noreferrer" style="font-weight:700; color:var(--dino-accent); font-size:0.95rem;">
                    PR #${pr.number.toString()} ↗
                  </a>
                  <span class="badge badge-amber">v${this.escapeHtml(pr.targetVersion)}</span>
                </div>
                <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(pr.mergedAt).toLocaleDateString('pt-BR')} • ${this.escapeHtml(pr.author)}</span>
              </div>
              <div style="font-weight:600; font-size:0.9rem; color:var(--text-main);">${this.escapeHtml(pr.title)}</div>
              <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${this.escapeHtml(pr.summary)}</div>
            </div>
          `)
          .join('\n')
      : '<p style="color:var(--text-muted); font-size:0.9rem;">Nenhuma Pull Request registrada recentemente no repositório.</p>';

    const versionsHtml = versionHistory.length > 0
      ? versionHistory
          .slice(-6)
          .reverse()
          .map((item) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.75rem; background:var(--bg-panel); border:1px solid var(--border); border-radius:6px;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-weight:700; color:var(--dino-accent);">v${this.escapeHtml(item.version)}</span>
                <span class="badge badge-amber">${this.escapeHtml(item.commitHash)}</span>
              </div>
              <div style="font-size:0.8rem; color:var(--text-muted);">
                ${item.lighthouse.scores.performance !== null ? `Perf: ${item.lighthouse.scores.performance.toString()} | ` : ''}
                ${(item.bundle.initialJsGzipBytes / 1024).toFixed(0)} kB gzip • ${new Date(item.releaseDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          `)
          .join('\n')
      : `<p style="color:var(--text-muted); font-size:0.9rem;">Versão atual: v${this.escapeHtml(currentVersion)}</p>`;

    return `
      <section id="releases" style="margin-top:4rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
          <div>
            <h2 class="section-title">Histórico de Releases & Pull Requests</h2>
            <p class="section-subtitle" style="margin-bottom:0;">Registro rastreável e auditável de cada PR incorporada e evolução histórica das releases do Trex.</p>
          </div>
          <a href="../CHANGELOG.md" style="color:var(--dino-accent); font-weight:700; font-size:0.9rem;">
            Ver Changelog Completo →
          </a>
        </div>

        <div class="grid grid-cols-2" style="gap:1.5rem;">
          <div>
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; color:var(--text-main);">Pull Requests Incorporadas Recentemente</h3>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${prsHtml}
            </div>
          </div>

          <div>
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; color:var(--text-main);">Evolução Histórica das Releases</h3>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${versionsHtml}
            </div>
          </div>
        </div>
      </section>
    `;
  };

  public buildGuideHtml = (guide: GuideItem, options: PortalBuilderOptions): string => {
    const formattedBody = this.convertMarkdownToSimpleHtml(guide.content);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="${this.escapeHtml(options.baseUrl)}">
  <title>${this.escapeHtml(guide.title)} — Trex Docs</title>
  <link rel="icon" type="image/png" href="../../logos/Trex.png">
  <style>
    :root {
      --bg-ground: #100f0d;
      --bg-panel: #171613;
      --bg-card: #201e19;
      --border: #332f27;
      --text-main: #f5f3ef;
      --text-muted: #a8a29e;
      --dino-accent: #22c55e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-ground);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.7;
    }
    a { color: var(--dino-accent); text-decoration: none; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--dino-accent);
    }
    article h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
    article h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    article h3 { font-size: 1.2rem; font-weight: 600; margin: 1.5rem 0 0.75rem; }
    article p { margin-bottom: 1rem; color: var(--text-main); }
    article ul, article ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
    article li { margin-bottom: 0.5rem; }
    pre {
      background: #000;
      border: 1px solid var(--border);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      color: #e5e7eb;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85em;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: var(--dino-accent);
    }
    pre code { background: none; padding: 0; color: inherit; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="../index.html" class="back-btn">← Voltar para Trex Docs</a>
      <span style="font-size:0.85rem; color:var(--text-muted);">Versão ${this.escapeHtml(options.version)}</span>
    </header>
    <article>
      ${formattedBody}
    </article>
  </div>
</body>
</html>`;
  };

  private convertMarkdownToSimpleHtml = (markdown: string): string => {
    const lines = markdown.split('\n');
    const result: string[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          result.push(`<pre><code>${this.escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      if (trimmed.startsWith('# ')) {
        result.push(`<h1>${this.escapeHtml(trimmed.slice(2))}</h1>`);
      } else if (trimmed.startsWith('## ')) {
        result.push(`<h2>${this.escapeHtml(trimmed.slice(3))}</h2>`);
      } else if (trimmed.startsWith('### ')) {
        result.push(`<h3>${this.escapeHtml(trimmed.slice(4))}</h3>`);
      } else if (trimmed.startsWith('- ')) {
        result.push(`<li>${this.formatInline(trimmed.slice(2))}</li>`);
      } else if (/^\d+\.\s/.test(trimmed)) {
        const item = trimmed.replace(/^\d+\.\s/, '');
        result.push(`<li>${this.formatInline(item)}</li>`);
      } else {
        result.push(`<p>${this.formatInline(trimmed)}</p>`);
      }
    }

    if (inCodeBlock) {
      result.push(`<pre><code>${this.escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
    }

    return result.join('\n');
  };

  private renderModelBadge = (modelUsed: string): string => {
    if (modelUsed.startsWith('fallback')) {
      return 'Documentação Oficial';
    }
    return `Gerado com IA (${this.escapeHtml(modelUsed)})`;
  };

  private cleanMarkdownText = (raw: string): string => {
    return raw
      .replace(/\(\[([a-f0-9]+)\]\([^)]+\)\)/gi, '')
      .replace(/\([a-f0-9]{7,40}\)/gi, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\[skip\s+ci\]/gi, '')
      .replace(/\*\*/g, '')
      .trim();
  };

  private formatInline = (text: string): string => {
    let formatted = this.escapeHtml(text);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    return formatted;
  };

  private escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
}

export { PortalBuilderService };
