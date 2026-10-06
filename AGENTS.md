# AGENTS.md — Regras e Diretrizes para Agentes de IA

Este documento é a fonte única da verdade para qualquer modelo de linguagem, agente autônomo ou desenvolvedor atuando no repositório `Trex-Http-Client`.

---

## 1. Regras Estritas e Inegociáveis

1. **Sem comentários em código**: Nunca adicione comentários ou explicações de código (JSDoc, comentários inline, cabeçalhos, etc.) em qualquer arquivo criado ou alterado. O código deve ser autoexplicativo, limpo e legível.
2. **Git estrito**: Nunca execute `git commit` ou `git push` sem solicitar e obter autorização prévia e explícita do desenvolvedor.
3. **Padrão de commit**: Mensagens de commit devem seguir rigorosamente a convenção `<type>(<scope>): <description>` em português (especificada na skill `commit-convention`).
4. **TypeScript forte e sem any**: É proibido o uso de `any`. Utilize tipagens estritas declaradas exclusivamente em arquivos `interfaces.ts` de cada domínio.
5. **Componentes `.vue` ultrafinos**: Mantenha nos arquivos `.vue` estritamente HTML e CSS. Extraia 100% da lógica e do estado local para composables dedicados. Use tags em `kebab-case`.
6. **Desenvolvimento orientado a testes (TDD)**: Escreva sempre o teste unitário na pasta `tests/` antes de escrever o código de implementação.
7. **Arrow functions e exportações ao final**: Todas as funções devem ser declaradas como arrow functions (`const minhaFunc = (): ReturnType => { ... }`). Exporte as funções e utilitários agrupados no final do arquivo (`export { func1, func2 }`), proibindo exportações inline (`export const`).
8. **Reaproveitamento e Composição**: Antes de criar código ou componentes novos, verifique o Design System (`design-system-mcp`), `src/shared/ui/` e `@vueuse/core`. Priorize composição com slots em vez de proliferação de props booleanas. É proibido duplicar código ou componentes entre domínios.
9. **100% Orientado a Objetos (OOP)**: Toda lógica de negócio, infraestrutura (`src/core/`), serviços, repositórios e entidades deve ser modelada exclusivamente através de Classes e princípios de OOP (encapsulamento, injeção de dependência e inversão de controle). Os composables do Vue atuam como adaptadores reativos (Presenters) ligando as classes ao template.

---

## 2. Princípios Arquiteturais e Estrutura de Domínios

Cada domínio ou componente segue a seguinte estrutura modular:

```text
features/exemplo/
├── tests/
│   ├── exemplo.service.spec.ts
│   └── use-exemplo.spec.ts
├── ExemploComponente/
│   ├── tests/
│   │   ├── ExemploComponente.spec.ts
│   │   └── use-exemplo-componente.spec.ts
│   ├── index.vue                   # Apenas template e classes visuais
│   ├── use-exemplo-componente.ts   # Adaptador reativo do componente
│   └── interfaces.ts               # Tipagens e props do componente
├── interfaces.ts                   # Tipos e contratos do domínio
├── exemplo.service.ts              # Classe de serviço OOP
├── exemplo.repository.ts           # Classe de repositório OOP
├── exemplo.entity.ts               # Classe da entidade de domínio
└── index.ts                        # Public API
```

---

## 3. Checklist de Validação para Modificações

Antes de finalizar qualquer tarefa:
- [ ] O teste unitário foi escrito antes do código de implementação na pasta `tests/`?
- [ ] Os testes unitários relevantes foram executados com `npm run test:unit` e passaram?
- [ ] Todos os tipos e contratos foram declarados no arquivo `interfaces.ts` sem nenhum `any`?
- [ ] O arquivo `.vue` contém apenas template e estilos, delegando a lógica para composable?
- [ ] Toda lógica de negócio, serviço ou repositório foi modelada como classe orientada a objetos?
- [ ] Foi verificado se já existe componente ou utilitário reutilizável antes de implementar?
- [ ] Todas as funções foram declaradas como arrow functions?
- [ ] Todas as funções e classes foram exportadas agrupadas no final do arquivo (`export { ... }`)?
- [ ] Nenhum comentário ou explicação foi adicionado ao código?
- [ ] O código foi verificado pelo linter com `npm run lint`?
