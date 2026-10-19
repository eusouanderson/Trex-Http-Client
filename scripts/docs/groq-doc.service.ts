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

  private buildFallbackOutput = (input: DocContextInput, reason: string): DocContextOutput => {
    const summary = input.commitMessage.length > 0
      ? `Atualização recente: ${input.commitMessage}`
      : 'Documentação técnica do cliente HTTP Trex, com suporte offline, coleções e variáveis.';

    const architectureHighlights = [
      'Core HTTP: Cliente com interceptors, retries com backoff exponencial e suporte a streaming/json.',
      'Segurança & Segredos: Provedores NoAuth, Bearer, Basic, ApiKey, Custom e OAuth2 PKCE com mascaramento seguro.',
      'Variáveis & Scripts: VariableResolver hierárquico e executor de scripts pós-resposta com tx e pm.',
      'Persistência Multi-Target: IndexedDB/Dexie para PWA com fallback em memória e schemas Zod.',
      'Customização: Seletor tipográfico com 8 fontes empacotadas e temas dinâmicos em variáveis CSS.',
    ];

    const changelogHighlights = input.commitMessage.length > 0
      ? [input.commitMessage]
      : ['Melhorias de desempenho e estabilização de rotinas da aplicação.'];


    return {
      summary,
      architectureHighlights,
      changelogHighlights,
      generatedAt: new Date().toISOString(),
      modelUsed: reason,
    };
  };
}

export { GroqDocService };

