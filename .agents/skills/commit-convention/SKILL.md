# Commit Convention

## Objetivo

Este documento define o padrão obrigatório de commits do projeto.

LLMs, agentes de código e desenvolvedores devem seguir estas regras ao criar, sugerir ou alterar mensagens de commit.

---

## 1. Formato obrigatório

Todo commit deve seguir:

```text
<type>(<scope>): <description>
```

Exemplos:

```text
feat(leads): adiciona filtro por status
fix(auth): corrige redirecionamento após login
refactor(http): simplifica cliente de requisições
test(leads): adiciona testes para paginação
docs(readme): atualiza instruções de instalação
chore(deps): atualiza dependências
```

O `scope` é opcional quando não houver um contexto claro.

Exemplo:

```text
docs: atualiza documentação do projeto
```

---

# 2. Tipos permitidos

Utilize **somente** os tipos abaixo.

| Tipo       | Quando utilizar                              |
| ---------- | -------------------------------------------- |
| `feat`     | Nova funcionalidade                          |
| `fix`      | Correção de bug                              |
| `refactor` | Refatoração sem mudança de comportamento     |
| `perf`     | Melhoria de performance                      |
| `test`     | Criação ou alteração de testes               |
| `docs`     | Alteração de documentação                    |
| `style`    | Formatação ou estilo sem alteração de lógica |
| `chore`    | Manutenção geral                             |
| `build`    | Alterações relacionadas ao build             |
| `ci`       | Alterações em CI/CD                          |
| `revert`   | Reversão de um commit anterior               |

### `feat`

Utilize quando uma nova capacidade for adicionada ao sistema.

```text
feat(leads): adiciona exportação de leads
```

### `fix`

Utilize quando o objetivo principal for corrigir um comportamento incorreto.

```text
fix(leads): corrige paginação da listagem
```

### `refactor`

Utilize quando o código for reorganizado ou melhorado sem alterar o comportamento esperado.

```text
refactor(api): extrai lógica de requisição para composable
```

### `perf`

Utilize quando a alteração tiver como objetivo principal melhorar performance.

```text
perf(table): reduz renderizações desnecessárias
```

### `test`

Utilize quando a alteração estiver relacionada exclusivamente a testes.

```text
test(leads): adiciona cobertura para filtros
```

### `docs`

Utilize para documentação.

```text
docs(api): documenta endpoints disponíveis
```

### `style`

Utilize para alterações que não modificam a lógica da aplicação.

```text
style(button): ajusta formatação do componente
```

### `chore`

Utilize para manutenção que não se enquadra nos tipos anteriores.

```text
chore(deps): atualiza dependências
```

### `build`

Utilize para alterações no processo de build.

```text
build(vite): ajusta configuração de produção
```

### `ci`

Utilize para alterações relacionadas a pipelines e automações de CI/CD.

```text
ci(github): adiciona workflow de testes
```

### `revert`

Utilize para desfazer um commit anterior.

```text
revert(leads): remove alteração de paginação
```

---

# 3. Regras para o scope

O `scope` deve representar a área afetada pela alteração.

Exemplos:

```text
feat(auth): adiciona recuperação de senha
feat(leads): adiciona filtro por status
fix(router): corrige redirecionamento
refactor(http): centraliza tratamento de erros
test(composables): adiciona testes para useApi
```

Use scopes específicos e consistentes.

Evite:

```text
feat(codigo): altera código
fix(coisas): corrige coisas
feat(diversos): várias alterações
```

Se não houver um scope realmente útil, omita-o:

```text
docs: atualiza documentação
chore: atualiza configuração do projeto
```

---

# 4. Regras para a descrição

A descrição deve:

* ser curta;
* ser objetiva;
* explicar o que foi alterado;
* começar com verbo no presente;
* não terminar com ponto;
* não descrever detalhes desnecessários da implementação.

### Bom

```text
feat(leads): adiciona filtro por status
fix(auth): corrige expiração do token
refactor(http): centraliza tratamento de erros
```

### Evitar

```text
feat(leads): foi criado um novo filtro de status para que os usuários possam filtrar os leads
```

```text
fix(auth): corrige bug.
```

```text
feat(leads): Alterado o filtro de status.
```

---

# 5. Idioma

As mensagens de commit devem ser escritas em **português**, salvo quando o projeto definir explicitamente outro idioma.

Use linguagem técnica e objetiva.

Exemplo:

```text
feat(http): adiciona suporte a requisições multipart
```

---

# 6. Commits atômicos

Cada commit deve representar uma alteração lógica.

Evite agrupar alterações não relacionadas.

### Incorreto

```text
feat: adiciona tela de leads, corrige login, atualiza dependências e altera documentação
```

### Preferível

```text
feat(leads): adiciona tela de listagem
fix(auth): corrige redirecionamento após login
chore(deps): atualiza dependências
docs(leads): documenta fluxo de listagem
```

---

# 7. Como a LLM deve escolher o tipo

Antes de gerar um commit, a LLM deve analisar a alteração realizada.

Utilize esta ordem de decisão:

```text
1. É uma reversão?
   -> revert

2. É uma nova funcionalidade?
   -> feat

3. É uma correção de comportamento incorreto?
   -> fix

4. O objetivo principal é performance?
   -> perf

5. É uma refatoração sem mudança de comportamento?
   -> refactor

6. É alteração exclusivamente de testes?
   -> test

7. É documentação?
   -> docs

8. É alteração de CI/CD?
   -> ci

9. É alteração de build?
   -> build

10. É somente formatação/estilo?
    -> style

11. É manutenção geral?
    -> chore
```

A LLM **não deve escolher o tipo baseado no nome do arquivo**.

O tipo deve ser determinado pelo **objetivo principal da alteração**.

---

# 8. Alterações que envolvem múltiplos tipos

Quando uma alteração envolver mais de um tipo, escolha o tipo correspondente ao **objetivo principal**.

Exemplo:

Uma nova funcionalidade também possui testes:

```text
feat(leads): adiciona filtro por status
```

Não utilizar:

```text
feat-test(leads): adiciona filtro e testes
```

Se as alterações forem independentes, elas devem ser separadas em commits.

---

# 9. Breaking Changes

Quando uma alteração quebra compatibilidade com o comportamento ou API existente, utilize `!`.

Formato:

```text
<type>!: <description>
```

ou:

```text
<type>(<scope>)!: <description>
```

Exemplos:

```text
feat(api)!: altera contrato de autenticação
refactor(http)!: remove suporte ao cliente legado
```

Quando possível, a descrição deve deixar claro o impacto da mudança.

---

# 10. Proibição de commits genéricos

A LLM não deve gerar mensagens como:

```text
fix: ajustes
feat: alterações
chore: update
fix: correções
feat: melhorias
refactor: refatoração
chore: mudanças
```

A mensagem deve permitir entender a alteração sem abrir o diff.

---

# 11. Proibição de informações artificiais

A LLM não deve adicionar informações que não estejam relacionadas à alteração.

Não adicionar:

```text
feat(leads): adiciona filtro por status - implementado por IA
```

Não adicionar:

```text
feat(leads): adiciona filtro por status [AI]
```

Não adicionar emojis.

Não adicionar mensagens promocionais.

---

# 12. Verificação antes do commit

Antes de sugerir ou criar um commit, a LLM deve:

1. analisar as alterações;
2. identificar os arquivos modificados;
3. entender o objetivo da alteração;
4. identificar se existem alterações não relacionadas;
5. verificar se o commit pode ser dividido;
6. escolher o tipo;
7. escolher o scope;
8. criar uma descrição objetiva;
9. validar o formato final.

Formato final esperado:

```text
<type>(<scope>): <description>
```

---

# 13. Regra para LLM

Quando o usuário solicitar um commit, a LLM deve **primeiro analisar o contexto da alteração**.

Não deve simplesmente criar um commit baseado na última mensagem do usuário.

Quando houver informação insuficiente para determinar corretamente o commit, a LLM deve solicitar contexto adicional ou analisar o diff disponível.

A LLM **não deve inventar**:

* funcionalidades;
* correções;
* scopes;
* arquivos alterados;
* motivos da alteração;
* breaking changes.

---

# 14. Exemplos práticos

### Nova funcionalidade

```text
feat(leads): adiciona filtro por status
```

### Correção

```text
fix(router): corrige redirecionamento para rota protegida
```

### Refatoração

```text
refactor(api): extrai cliente HTTP para composable
```

### Performance

```text
perf(table): reduz renderizações da listagem
```

### Testes

```text
test(leads): adiciona testes para paginação
```

### Documentação

```text
docs(api): documenta configuração do cliente HTTP
```

### Dependências

```text
chore(deps): atualiza dependências do projeto
```

### CI

```text
ci(github): adiciona execução dos testes no pipeline
```

### Build

```text
build(vite): ajusta configuração de produção
```

### Estilo

```text
style(button): ajusta formatação do componente
```

### Breaking Change

```text
feat(api)!: altera contrato de autenticação
```

---

# 15. Checklist da LLM

Antes de finalizar uma mensagem de commit:

* [ ] O tipo está entre os tipos permitidos?
* [ ] O scope representa corretamente a área alterada?
* [ ] A descrição é objetiva?
* [ ] A descrição está em português?
* [ ] A descrição começa com verbo no presente?
* [ ] Não existe ponto no final?
* [ ] O commit representa uma única alteração lógica?
* [ ] Não foram inventadas informações?
* [ ] Não existem emojis?
* [ ] Não existe informação sobre IA/LLM na mensagem?
* [ ] O commit realmente descreve o diff?
* [ ] Existe breaking change? Se sim, foi utilizado `!`?

---

# 16. Regra principal

> **O commit deve explicar a intenção da alteração, não apenas descrever os arquivos modificados.**

Exemplo:

```text
fix(leads): corrige paginação da listagem
```

é preferível a:

```text
chore(leads): altera LeadsTable.vue
```

porque o primeiro comunica **o motivo da alteração**, enquanto o segundo apenas informa que um arquivo foi modificado.
