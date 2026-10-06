---
name: development-guidelines
description: Guia e padrões obrigatórios de desenvolvimento frontend para o Trex-Http-Client (TDD, SOLID, 100% Orientado a Objetos com Classes, separação estrita de .vue, composables como adaptadores reativos, interfaces.ts por domínio, arrow functions obrigatórias, export agrupado no final, reaproveitamento de código e proibição de any).
---

# Development Guidelines — Trex-Http-Client

## Objetivo
Este documento define as regras e o fluxo obrigatório de desenvolvimento para o projeto `Trex-Http-Client`. Todo código desenvolvido por agentes, LLMs ou desenvolvedores deve seguir rigorosamente estas diretrizes.

---

## 1. Test-Driven Development (TDD Obrigatório)

O desenvolvimento de novas funcionalidades, composables, serviços ou componentes deve seguir o ciclo TDD:

1. **Red**: Criar primeiro o teste unitário dentro da subpasta `tests/` do respectivo domínio (`tests/<nome>.spec.ts`). O teste deve expressar o comportamento esperado e falhar.
2. **Green**: Escrever a implementação mínima necessária para fazer o teste passar.
3. **Refactor**: Refatorar o código para garantir clareza, aplicação de princípios SOLID e ausência de duplicação, mantendo a suíte de testes verde.

---

## 2. Paradigma 100% Orientado a Objetos (OOP)

Toda a arquitetura de regras de negócio, infraestrutura e orquestração de dados é construída sobre Programação Orientada a Objetos:

1. **Classes no Core, Serviços, Repositórios e Entidades**:
   - Toda funcionalidade em `src/core/` e nas camadas de domínio em `src/features/` deve ser modelada em **Classes**.
   - Encapsulamento estrito: utilize modificadores explícitos (`private`, `protected`, `public`, `readonly`).
   - Métodos de classe podem utilizar arrow functions para garantir escopo léxico previsível:
   ```ts
   export class RequestService implements IRequestService {
     constructor(private readonly client: HttpClient) {}

     public readonly execute = async (request: RequestEntity): Promise<HttpResponse> => {
       return this.client.request(request.toConfig());
     };
   }
   ```
2. **Entidades com Comportamento (Modelos Ricos)**:
   - Evite modelos anêmicos com dados soltos. Entidades de domínio devem ser classes com métodos de validação, conversão e manipulação do próprio estado.
3. **Repositórios de Dados**:
   - Toda interação com Dexie/IndexedDB é isolada em classes de repositório (`class CollectionRepository implements ICollectionRepository`).
4. **Composables como Adaptadores Reativos**:
   - Os composables (`use-*.ts`) atuam como pontes e adaptadores reativos (Pattern Presenter/Adapter), conectando as classes de serviço ao ciclo de vida reativo do Vue (`ref`, `computed`) para consumo no template.

---

## 3. Componentes `.vue` Ultra-Finos (Apresentação Pura)

Os arquivos `.vue` contêm exclusivamente HTML e estilos:

- **Proibição de Lógica no `.vue`**: Nenhuma regra de negócio, chamada de API, transformação complexa de dados ou manipulação de arrays/objetos deve residir dentro da tag `<script>` do componente `.vue`.
- **Extração para Composable**: Toda lógica de apresentação, handlers de eventos e estados reativos locais devem ser extraídos para um composable dedicado (`use-<component>.ts`).
- **Estrutura permitida no `<script setup lang="ts">`**:
  - Declaração de props (`defineProps`).
  - Declaração de emissões (`defineEmits`).
  - Chamada e desestruturação do composable associado.
- **Convenção de Template**:
  - Tags de componentes utilizam padrão `kebab-case`.
  - Classes visuais via Tailwind CSS com a paleta temática (`dino`, `fossil`, `amber`, `magma`, `bone`, `surface`).

---

## 4. Gestão de Tipos e Contratos (`interfaces.ts`)

- **Arquivo `interfaces.ts` Obrigatório**: Cada domínio, módulo ou componente deve ter seu próprio arquivo `interfaces.ts` para centralizar interfaces, types e contratos abstratos.
- **Proibição Total de `any`**: O uso de `any` é terminantemente proibido. Utilize generics, types utilitários ou `unknown` acompanhado de Type Guards e validação via Zod.
- **Interfaces Segregadas**: Defina contratos enxutos e coesos para props, emissões, payloads e modelos de dados.
- **Retornos de Métodos**: Declare o tipo de retorno explicitamente somente quando o retorno for consumido.

---

## 5. Padrão de Funções e Exportações

1. **Arrow Functions Obrigatórias**:
   - Todas as funções utilitárias avulsas, métodos em arrow de classes e composables devem ser declarados com sintaxe de arrow function:
   ```ts
   const somar = (a: number, b: number): number => a + b;
   ```
   - É proibido o uso da palavra-chave `function` para declaração de funções de módulo (`function calcular() {}`).
2. **Exportações Agrupadas ao Final**:
   - Não utilize exportações inline (`export const ...` ou `export class ...` dispersos quando houver múltiplas declarações).
   - Exporte as classes, instâncias e utilitários agrupados em uma cláusula única ao final do arquivo:
   ```ts
   export { RequestService, requestService };
   ```

---

## 6. Princípios SOLID Aplicados

### S — Single Responsibility Principle (Responsabilidade Única)
- O arquivo `.vue` apenas renderiza a interface.
- O composable (`use-*.ts`) atua como adaptador reativo entre o serviço e a UI.
- O serviço (`*.service.ts`) orquestra o domínio e regras de negócio.
- O repositório (`*.repository.ts`) gerencia exclusivamente a persistência.
- A store (`*.store.ts`) centraliza estados compartilhados transversais.

### O — Open/Closed Principle (Aberto/Fechado)
- Classes, componentes e composables devem ser extensíveis via herança polimórfica, composição, slots e injeção de dependência sem alterar seu núcleo.

### L — Liskov Substitution Principle (Substituição de Liskov)
- Qualquer implementação de repositório ou cliente HTTP deve ser intercambiável por outra que implemente o mesmo contrato da interface.

### I — Interface Segregation Principle (Segregação de Interfaces)
- Não crie interfaces inchadas. Divida contratos em interfaces pequenas e específicas para cada finalidade.

### D — Dependency Inversion Principle (Inversão de Dependência)
- Serviços e classes de alto nível devem depender de abstrações (interfaces de `interfaces.ts`), recebendo implementações via injeção de dependência no construtor.

---

## 7. Padrão de Reaproveitamento de Código e Componentes

1. **Verificação Prévia Obrigatória**:
   - Antes de escrever qualquer código novo, componente visual ou classe utilitária, verifique se já existe algo semelhante:
     1) Verificar o Design System compartilhado via MCP (`design-system-mcp`).
     2) Verificar se a primitiva já existe em `src/shared/ui/` ou `src/core/`.
     3) Verificar o `@vueuse/core` para utilitários reativos comuns antes de implementar do zero.
2. **Separação de Componentes por Camada de Reuso**:
   - **`src/shared/ui/` (Dumb Components)**: Primitivas visuais genéricas agnósticas de regras de negócio HTTP (`Button`, `Modal`, `SplitPanel`, `Badge`, `Tabs`).
   - **`src/features/<dominio>/` (Smart Components)**: Componentes específicos de negócio, expostos apenas através da Public API (`index.ts`).
3. **Composição Baseada em Slots**:
   - Prefira compor variações visuais utilizando slots (`default`, slots nomeados e scoped slots) em vez de acumular flags booleanas.
4. **Reuso de Lógica via Classes de Serviço e Composables**:
   - Lógica de negócio é encapsulada em classes reutilizáveis por qualquer composable ou worker.
   - Composables adaptadores expõem contratos padronizados (`isLoading`, `error`, dados e função executora).
5. **Anti-Padrões de Reuso Proibidos**:
   - **Copy-Paste**: Proibido duplicar lógica ou blocos visuais idênticos entre domínios.
   - **Abstração Prematura**: Não crie abstrações complexas ou componentes compartilhados para padrões que só são usados em um único ponto do código (regra dos três usos).
   - **Imports Profundos**: Consuma sempre a Public API do módulo através do seu `index.ts`.

---

## 8. Regras Estritas de Código Limpo

1. **Sem Comentários**: Nunca inclua comentários inline, explicações em código, JSDoc ou cabeçalhos. O código deve ser autoexplicativo através de nomenclatura precisa.
2. **Reatividade e Performance**:
   - Utilize `computed` em vez de métodos para qualquer cálculo ou valor derivado de estado reativo.
   - Não realize otimizações prematuras.
3. **Tratamento de Estados**: Considere e exponha explicitamente estados de carregamento (`isLoading`), erro (`errorMessage` ou `error`) e dados prontos.
