import type { GuideItem, IPortalBuilderService, PortalBuilderOptions } from './interfaces';

class PortalBuilderService implements IPortalBuilderService {
  public buildPortalHtml = (options: PortalBuilderOptions): string => {
    const { title, version, commitHash, contextOutput, apiDocsPath, guides } = options;

    const architectureItemsHtml = contextOutput.architectureHighlights
      .map((item) => `<li class="flex items-start gap-2"><span class="text-dino-accent font-bold">›</span><span>${this.escapeHtml(item)}</span></li>`)
      .join('\n');

    const changelogItemsHtml = contextOutput.changelogHighlights
      .map((item) => `<li class="flex items-start gap-2"><span class="text-amber-accent font-bold">›</span><span>${this.escapeHtml(item)}</span></li>`)
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

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    .module-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(51, 47, 39, 0.5);
    }
    .module-item:last-child { border-bottom: none; }
    .code-pill {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.8rem;
      background: #000;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: 1px solid var(--border);
      color: var(--dino-accent);
    }
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
        <a href="#guias">Guias</a>
        <a href="#arquitetura">Arquitetura</a>
        <a href="${this.escapeHtml(apiDocsPath)}">Referência da API TypeDoc</a>
        <a href="../../Trex-Http-Client/" class="btn btn-primary">Abrir Trex App</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div style="display:inline-flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
          <span class="badge badge-amber">Commit: ${this.escapeHtml(commitHash)}</span>
          <span class="badge badge-dino">100% OOP & Strict TypeScript</span>
        </div>
        <h1>Documentação Técnica Inteligente</h1>
        <p>Referência técnica de API, arquitetura Feature-Sliced / DDD, contratos e guias operacionais do Trex HTTP Client.</p>
        <div class="hero-actions">
          <a href="${this.escapeHtml(apiDocsPath)}" class="btn btn-primary">
            Explorar Referência da API (TypeDoc) ↗
          </a>
          <a href="#guias" class="btn btn-secondary">
            Consultar Guias Práticos ↓
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
          <span class="badge badge-dino">Gerado com IA (${this.escapeHtml(contextOutput.modelUsed)})</span>
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
              <a href="${this.escapeHtml(apiDocsPath)}modules/core_http.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/security</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Segurança & Segredos</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Provedores OOP de autenticação (OAuth2 com PKCE S256, Bearer, Basic Auth, ApiKey) e SecretsMaskerService para mascaramento automático de credenciais.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiDocsPath)}modules/core_security.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/variables</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Variáveis & Interpolação</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">VariableResolverService com resolução hierárquica, interpolação em cascata ({{variavel}}) e prevenção ativa contra dependências cíclicas.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiDocsPath)}modules/core_variables.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/scripts</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Scripts de Teste (tx / pm)</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Sandbox seguro para execução de asserções em JavaScript pós-resposta, com compatibilidade Postman (pm) e namespace nativo Trex (tx).</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiDocsPath)}modules/core_scripts.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/core/storage</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Persistência Multi-Target</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Abstração agnóstica de banco de dados com Dexie / IndexedDB no PWA, suporte a migrações idempotentes e fallback transparente em memória.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiDocsPath)}modules/core_storage.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>

          <div class="card">
            <span class="code-pill">src/features/collections</span>
            <h3 style="font-size:1.15rem; font-weight:700; margin:0.75rem 0 0.5rem;">Coleções & Runner</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Árvore hierárquica com drag-and-drop, exportação JSON, menu de contexto e CollectionRunnerService para execução em lote de requisições.</p>
            <div style="margin-top:1rem;">
              <a href="${this.escapeHtml(apiDocsPath)}modules/features_collections.html" style="color:var(--dino-accent); font-weight:600; font-size:0.85rem;">Ver símbolos da API →</a>
            </div>
          </div>
        </div>
      </section>

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

  public buildGuideHtml = (guide: GuideItem, options: PortalBuilderOptions): string => {
    const formattedBody = this.convertMarkdownToSimpleHtml(guide.content);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

