---
name: zod-typescript
description: Guia e padrões obrigatórios para uso eficiente, seguro e arquitetural de Zod + TypeScript como camada de validação em runtime nas fronteiras da aplicação.
---

# Zod + TypeScript

## Objetivo da Skill

A Skill ensina a utilizar Zod como uma **camada de validação em runtime nas fronteiras da aplicação**, evitando uso excessivo, duplicação de tipos, `any`, casts desnecessários e schemas espalhados pelo código.

A Skill funciona como uma regra de engenharia para agentes de código.

---

# 1. Princípio fundamental

A Skill segue esta regra:

> TypeScript garante os tipos durante o desenvolvimento e compilação. Zod valida dados reais durante a execução.

TypeScript não valida dados externos em runtime.

Sempre que dados entrarem na aplicação vindos de uma fonte não confiável, considerar validação com Zod.

Exemplos de fontes externas:

* API
* `localStorage`
* `sessionStorage`
* `postMessage`
* URL/query parameters
* formulários
* arquivos
* variáveis de ambiente
* WebSocket
* dados vindos de SDKs externos
* respostas de serviços externos

---

# 2. Não utilizar Zod indiscriminadamente

A Skill NÃO recomenda Zod para todo objeto interno da aplicação.

Evitar:

```ts
function processUser(user: User) {
  const result = UserSchema.safeParse(user);
}
```

quando `user` já foi validado na fronteira.

A arquitetura preferencial é:

```text
Fonte externa
    ↓
unknown
    ↓
Zod
    ↓
Dado validado
    ↓
Domínio da aplicação
```

Depois da validação, o dado deve poder circular pela aplicação sem validações repetitivas.

---

# 3. Schema como fonte de verdade

A Skill prioriza schemas como fonte de verdade.

Preferir:

```ts
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;
```

Evitar duplicar:

```ts
interface User {
  id: number;
  name: string;
  email: string;
}
```

junto com um schema equivalente.

A regra é:

```text
Schema
   ↓
z.infer
   ↓
TypeScript type
```

---

# 4. Evitar `any`

A Skill considera `any` proibido por padrão.

Nunca recomendar:

```ts
z.any()
```

como solução para dados desconhecidos.

Preferir:

```ts
z.unknown()
```

quando a estrutura realmente não puder ser conhecida.

Depois, utilizar um schema para transformar `unknown` em um tipo confiável.

---

# 5. `parse` vs `safeParse`

Decisão automática de quando utilizar cada um:

### `parse`

Usar quando dados inválidos representam uma condição excepcional e devem interromper o fluxo.

Exemplo:

```ts
const config = ConfigSchema.parse(env);
```

### `safeParse`

Usar quando dados inválidos fazem parte de um fluxo esperado.

Exemplo:

```ts
const result = UserSchema.safeParse(data);

if (!result.success) {
  handleError(result.error);
}
```

`safeParse` é especialmente apropriado para:

* formulários;
* entradas de usuários;
* dados externos;
* APIs onde erro de contrato precisa ser tratado;
* dados opcionais ou potencialmente inválidos.

---

# 6. Validação de API

A Skill prioriza validação de respostas externas.

Exemplo:

```ts
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;

async function getUser(): Promise<User> {
  const response = await api.get('/users/1');

  return UserSchema.parse(response.data);
}
```

O service deve funcionar como uma fronteira de confiança.

Preferir:

```text
HTTP
 ↓
API Service
 ↓
Zod
 ↓
Domain Model
 ↓
Composable / Store / Vue
```

Evitar espalhar validações pelo componente.

---

# 7. Reutilização de schemas

A Skill utiliza composição de schemas.

Exemplo:

```ts
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});
```

Para criação:

```ts
const CreateUserSchema = UserSchema.omit({
  id: true,
});
```

Para atualização:

```ts
const UpdateUserSchema = UserSchema.partial();
```

Para projeções:

```ts
const UserSummarySchema = UserSchema.pick({
  id: true,
  name: true,
});
```

Evitar copiar e colar schemas semelhantes.

---

# 8. Enums e valores controlados

Quando os valores possíveis forem conhecidos, não utilizar simplesmente:

```ts
status: z.string()
```

Preferir:

```ts
status: z.enum([
  'pending',
  'approved',
  'rejected',
]);
```

Utilizar schemas restritivos quando isso representar corretamente o domínio.

---

# 9. Transformação de dados

A Skill pode utilizar Zod para normalizar dados externos quando necessário.

Exemplo:

```ts
const UserSchema = z.object({
  id: z.coerce.number(),
});
```

Porém, não utilizar coercion para esconder problemas de contrato.

Distinção necessária:

```text
Normalização intencional
        VS
Correção silenciosa de contrato quebrado
```

Se o backend deveria enviar um número e está enviando uma string, sinalizar o problema quando apropriado.

---

# 10. Fronteira entre sistemas

A Skill reconhece Zod como uma camada Anti-Corruption Layer (ACL).

Exemplo:

```text
Backend
   ↓
Contrato externo
   ↓
Zod
   ↓
Transformação
   ↓
Modelo interno
   ↓
Frontend
```

Se o backend possuir nomes desfavoráveis ou estruturas legadas:

```json
{
  "nm_cliente": "Anderson",
  "tp_pessoa": "PJ"
}
```

transformar para:

```ts
const ExternalCustomerSchema = z.object({
  nm_cliente: z.string(),
  tp_pessoa: z.enum(['PF', 'PJ']),
}).transform((data) => ({
  name: data.nm_cliente,
  personType: data.tp_pessoa === 'PJ' ? 'company' : 'individual',
}));
```

O restante da aplicação não deve depender do contrato externo quando houver benefício arquitetural em isolá-lo.

---

# 11. Organização dos schemas

Organização padrão por domínio e responsabilidade:

```text
src/
├── schemas/
│   ├── auth.schema.ts
│   ├── user.schema.ts
│   ├── lead.schema.ts
│   └── pagination.schema.ts
│
├── services/
├── composables/
├── stores/
└── components/
```

Evitar um arquivo gigantesco contendo toda a aplicação (`schemas.ts`).

---

# 12. Vue + Zod

Fluxo arquitetural com Vue e TypeScript:

```text
API
 ↓
Service
 ↓
Zod
 ↓
Pinia/Composable
 ↓
Component
```

O componente Vue não deve ser responsável por validar novamente dados que já foram validados no service.

Para formulários:

```text
Form
 ↓
Zod
 ↓
Submit
 ↓
API
```

Evitar duplicação entre regras de validação do formulário e schemas existentes.

---

# 13. Dados persistidos

Para:

* localStorage;
* sessionStorage;
* IndexedDB;
* cache persistido;

considerar os dados como não confiáveis.

Exemplo:

```ts
const PreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']),
});

const raw = localStorage.getItem('preferences');

if (raw) {
  const result = PreferencesSchema.safeParse(JSON.parse(raw));
  if (result.success) {
    applyTheme(result.data.theme);
  }
}
```

Dados persistidos podem estar corrompidos, desatualizados, em formato legado, modificados manualmente ou incompatíveis.

---

# 14. Variáveis de ambiente

Sempre que possível, validar configurações importantes na inicialização:

```ts
const EnvSchema = z.object({
  API_URL: z.string().url(),
  APP_ENV: z.enum([
    'development',
    'production',
  ]),
});
```

Configuração inválida deve falhar cedo.

---

# 15. Erros de validação

Não realizar capturas genéricas silenciosas. Considerar:

* contexto;
* mensagens úteis;
* logging;
* tratamento de UX;
* diferenciação entre erro de contrato e erro de negócio.

Fluxo:

```text
Erro de validação Zod
        ↓
Contrato externo inválido
        ↓
Log técnico
        ↓
Tratamento apropriado
```

Não transformar automaticamente erro de contrato em erro genérico de usuário.

---

# 16. Performance

Evitar validações redundantes:

```text
API
 ↓ Zod
Service
 ↓
Store
 ↓
Composable
 ↓
Component
```

A validação deve ocorrer na fronteira apropriada.

---

# 17. Testes

Recomendar testes para schemas importantes:

* entrada válida;
* entrada inválida;
* campos obrigatórios;
* enums;
* limites;
* transformações;
* casos de borda.

Exemplo:

```ts
expect(UserSchema.safeParse(validUser).success).toBe(true);
expect(UserSchema.safeParse(invalidUser).success).toBe(false);
```

Não criar testes redundantes apenas para aumentar cobertura.

---

# 18. Regra contra overengineering

Antes de criar um schema, verificar:

1. O dado vem de fora da aplicação?
2. O dado pode estar inválido em runtime?
3. Existe um contrato que precisa ser protegido?
4. A validação traz benefício real?
5. Já existe um schema que pode ser reutilizado?
6. A validação está sendo feita na fronteira correta?

Se a resposta for não, não criar Zod apenas por criar.

---

# 19. Regra para código existente

Antes de alterar código existente:

1. procurar schemas Zod existentes;
2. procurar tipos relacionados;
3. procurar validações duplicadas;
4. identificar a fronteira de entrada dos dados;
5. reutilizar schemas existentes;
6. evitar criar uma nova abstração sem necessidade.

Nunca criar um novo schema se um existente puder ser estendido ou composto adequadamente.

---

# 20. Regra para geração de código

Quando gerar código:

* utilizar TypeScript estrito;
* evitar `any`;
* evitar casts `as` desnecessários;
* preferir `z.infer`;
* reutilizar schemas;
* validar dados externos;
* evitar validações repetidas;
* manter schemas pequenos e composáveis;
* manter responsabilidades claras;
* não colocar lógica de negócio dentro do schema sem necessidade.

---

# 21. Checklist obrigatório

Antes de finalizar uma implementação envolvendo Zod, verificar:

* [ ] Os dados externos estão sendo validados?
* [ ] O schema está na fronteira correta?
* [ ] O schema pode ser reutilizado?
* [ ] Existe duplicação de tipos?
* [ ] É possível utilizar `z.infer`?
* [ ] Existe algum `any` desnecessário?
* [ ] `unknown` seria mais adequado?
* [ ] A validação está sendo executada mais vezes do que deveria?
* [ ] O schema representa corretamente o domínio?
* [ ] Existem valores que deveriam ser enums?
* [ ] Existem transformações necessárias?
* [ ] A coercion está mascarando um problema?
* [ ] Existem testes para casos importantes?
* [ ] A solução está simples o suficiente?

---

# 22. Comportamento esperado da Skill

Quando receber uma tarefa envolvendo Zod:

1. entender o fluxo dos dados;
2. identificar a origem dos dados;
3. identificar a fronteira de confiança;
4. procurar schemas existentes;
5. reutilizar ou compor schemas;
6. definir o schema mínimo necessário;
7. inferir os tipos com `z.infer`;
8. validar os dados na fronteira;
9. evitar validações redundantes;
10. evitar `any`;
11. testar casos relevantes;
12. explicar decisões arquiteturais importantes.

---

# 23. Princípio final

> **Zod não deve estar em todos os lugares. Zod deve estar nos lugares certos.**

A arquitetura desejada é:

```text
             MUNDO EXTERNO
                   │
                   ▼
              unknown
                   │
                   ▼
             ┌──────────┐
             │   ZOD    │
             │ Validate │
             │Transform │
             └────┬─────┘
                  │
                  ▼
            TIPO CONFIÁVEL
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Service     Store     Composable
                              │
                              ▼
                           Vue UI
```

Priorizar **segurança de runtime, simplicidade, reutilização, performance e arquitetura limpa**, e não simplesmente aumentar a quantidade de schemas no projeto.
