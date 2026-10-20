import type {
  DocContextInput,
  DocContextOutput,
  GroqChatCompletionRequest,
  GroqChatCompletionResponse,
  IGroqDocService,
} from './interfaces';

class GroqDocService implements IGroqDocService {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly primaryModel: string;
  private readonly fallbackModel: string;

  constructor(
    apiKey = process.env.GROQ_API_KEY ?? '',
    endpoint = 'https://api.groq.com/openai/v1/chat/completions',
    primaryModel = 'llama-3.3-70b-versatile',
    fallbackModel = 'llama-3.1-8b-instant',
  ) {
    this.apiKey = apiKey.trim();
    this.endpoint = endpoint;
    this.primaryModel = primaryModel;
    this.fallbackModel = fallbackModel;
  }

  public analyzeChanges = async (input: DocContextInput): Promise<DocContextOutput> => {
    if (this.apiKey.length === 0) {
      return this.buildFallbackOutput(input, 'fallback-local');
    }


    try {
      return await this.requestCompletion(input, this.primaryModel);
    } catch {
      try {
        return await this.requestCompletion(input, this.fallbackModel);
      } catch {
        return this.buildFallbackOutput(input, 'fallback-error');
      }
    }
  };

  private requestCompletion = async (
    input: DocContextInput,
    model: string,
  ): Promise<DocContextOutput> => {
    const systemPrompt =
      'Você é o assistente técnico de documentação do Trex-Http-Client. ' +
      'Analise o diff e as alterações da Pull Request / commit fornecidas e retorne EXCLUSIVAMENTE um objeto JSON ' +
      'válido sem blocos de formatação markdown (sem ```json), contendo:\n' +
      '{\n' +
      '  "summary": "Resumo objetivo e técnico das alterações recentes",\n' +
      '  "architectureHighlights": ["destaque arquitetural 1", "destaque 2"],\n' +
      '  "changelogHighlights": ["item de changelog 1", "item 2"]\n' +
      '}\n' +
      'Regras:\n' +
      '- Idioma: Português do Brasil.\n' +
      '- Seja estritamente factual e objetivo.\n' +
      '- Não invente funcionalidades, classes ou endpoints.\n' +
      '- Nunca inclua chaves, tokens ou segredos.';

    const diffSample = input.gitDiff.slice(0, 7000);
    const changelogSample = input.existingChangelog.slice(0, 1500);

    const userPrompt =
      `Commit: ${input.commitHash}\n` +
      `Mensagem: ${input.commitMessage}\n\n` +
      `Diff recente:\n${diffSample}\n\n` +
      `Changelog recente:\n${changelogSample}`;

    const payload: GroqChatCompletionRequest = {
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Groq API responded with status ${response.status.toString()}`);
    }

    const data = (await response.json()) as GroqChatCompletionResponse;
    const choice = data.choices[0];
    const content = choice?.message.content;
    if (typeof content !== 'string' || content.length === 0) {
      throw new Error('Groq API returned empty choice');
    }

    const cleanedContent = this.sanitizeJsonString(content);
    const parsed = JSON.parse(cleanedContent) as {
      summary?: string;
      architectureHighlights?: string[];
      changelogHighlights?: string[];
    };

    const summary = typeof parsed.summary === 'string' && parsed.summary.length > 0
      ? parsed.summary
      : (input.commitMessage.length > 0 ? input.commitMessage : 'Documentação atualizada.');

    return {
      summary,
      architectureHighlights: Array.isArray(parsed.architectureHighlights) && parsed.architectureHighlights.length > 0
        ? parsed.architectureHighlights
        : ['Módulos core e features sincronizados com a versão mais recente.'],
      changelogHighlights: Array.isArray(parsed.changelogHighlights) && parsed.changelogHighlights.length > 0
        ? parsed.changelogHighlights
        : [input.commitMessage.length > 0 ? input.commitMessage : 'Melhorias contínuas do Trex-Http-Client.'],
      generatedAt: new Date().toISOString(),
      modelUsed: model,
    };
  };

  private sanitizeJsonString = (raw: string): string => {
    let sanitized = raw.trim();
    if (sanitized.startsWith('```json')) {
      sanitized = sanitized.slice(7);
    } else if (sanitized.startsWith('```')) {
      sanitized = sanitized.slice(3);
    }
    if (sanitized.endsWith('```')) {
      sanitized = sanitized.slice(0, -3);
    }
    return sanitized.trim();
  };

  private cleanTextLine = (line: string): string => {
    return line
      .replace(/\(\[([a-f0-9]+)\]\([^)]+\)\)/gi, '')
      .replace(/\([a-f0-9]{7,40}\)/gi, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\[skip\s+ci\]/gi, '')
      .replace(/\*\*/g, '')
      .trim();
  };

  private extractCleanChangelogItems = (rawMessage: string, existingChangelog: string): string[] => {
    const lines = rawMessage.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const bulletLines = lines.filter((l) => l.startsWith('* ') || l.startsWith('- '));

    if (bulletLines.length > 0) {
      const items = bulletLines
        .map((l) => this.cleanTextLine(l.slice(2)))
        .filter((l) => l.length > 0 && !l.startsWith('#'));
      if (items.length > 0) {
        return items;
      }
    }

    const nonHeaderLines = lines.filter(
      (l) => !l.startsWith('#') && !l.startsWith('chore(release):') && !l.toLowerCase().includes('skip ci'),
    );
    if (nonHeaderLines.length > 0) {
      const cleaned = this.cleanTextLine(nonHeaderLines[0] ?? '');
      if (cleaned.length > 0) {
        return [cleaned];
      }
    }

    if (rawMessage.trim().length > 0) {
      const firstLine = this.cleanTextLine(lines[0] ?? rawMessage);
      if (firstLine.length > 0) {
        return [firstLine];
      }
    }

    if (existingChangelog.length > 0) {
      const clLines = existingChangelog
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('* ') || l.startsWith('- '));
      const extracted = clLines.slice(0, 3).map((l) => this.cleanTextLine(l.slice(2)));
      if (extracted.length > 0) {
        return extracted;
      }
    }

    return ['Melhorias contínuas e estabilidade técnica da versão.'];
  };

  private buildCleanSummary = (commitMessage: string, cleanItems: string[]): string => {
    if (cleanItems.length === 0) {
      return 'Documentação técnica do cliente HTTP Trex, com suporte offline, coleções e variáveis.';
    }

    const firstItem = cleanItems[0] ?? '';
    if (commitMessage.includes('chore(release):')) {
      return `Atualização recente: ${cleanItems.join('; ')}`;
    }

    return `Atualização recente: ${firstItem}`;
  };

  private buildFallbackOutput = (input: DocContextInput, reason: string): DocContextOutput => {
    const cleanItems = this.extractCleanChangelogItems(input.commitMessage, input.existingChangelog);
    const summary = this.buildCleanSummary(input.commitMessage, cleanItems);

    const architectureHighlights = [
      'Core HTTP: Cliente com interceptors, retries com backoff exponencial e suporte a streaming/json.',
      'Segurança & Segredos: Provedores NoAuth, Bearer, Basic, ApiKey, Custom e OAuth2 PKCE com mascaramento seguro.',
      'Variáveis & Scripts: VariableResolver hierárquico e executor de scripts pós-resposta com tx e pm.',
      'Persistência Multi-Target: IndexedDB/Dexie para PWA com fallback em memória e schemas Zod.',
      'Customização: Seletor tipográfico com 8 fontes empacotadas e temas dinâmicos em variáveis CSS.',
    ];

    return {
      summary,
      architectureHighlights,
      changelogHighlights: cleanItems,
      generatedAt: new Date().toISOString(),
      modelUsed: reason,
    };
  };
}

export { GroqDocService };

