# Contribuindo para o Trex-Http-Client

Obrigado por se interessar em contribuir para o Trex-Http-Client! Nós adotamos uma cultura estrita de qualidade, arquitetura limpa e testes. Siga as diretrizes abaixo para que o seu Pull Request (PR) seja aprovado.

## 🚀 Como começar

1. Faça um Fork deste repositório.
2. Clone o repositório na sua máquina local.
3. Instale as dependências com `pnpm install` (certifique-se de usar o Node >= 22).
4. Crie uma branch para a sua modificação: `git checkout -b feature/minha-feature` ou `git checkout -b fix/meu-bug`.

## 📐 Diretrizes Arquiteturais (Obrigatório)

O Trex-Http-Client segue regras estritas definidas nos nossos guias. Qualquer PR que violar estas regras será rejeitado no Code Review:

- **100% Orientado a Objetos e TDD**: As regras de negócio e infraestrutura devem estar em Classes (Services, Repositories). Você deve escrever os testes *antes* de escrever o código.
- **Tipagem Forte**: O uso de `any` é **proibido**. Todos os tipos e interfaces devem estar explícitos em arquivos `interfaces.ts`.
- **Sem Comentários no Código**: O código deve ser tão limpo que se explica sozinho. Não use JSDoc ou comentários em linha.
- **Componentes Vue Ultrafinos**: Arquivos `.vue` só devem conter a marcação HTML e o CSS. Toda a lógica de apresentação e reatividade deve ser encapsulada num "Composable" exportado ao final do arquivo (`use-nome-do-componente.ts`).
- **Funções Arrow**: Toda função deve ser do tipo "Arrow Function".

## 🧪 Validando Localmente

Antes de enviar seu commit, sempre valide o projeto localmente para garantir que o pipeline de PR passará:

```bash
# Verifique a tipagem
pnpm exec vue-tsc -b

# Rode o Linter
pnpm run lint

# Execute a suíte de testes unitários (espera-se 100% de cobertura)
pnpm run test:unit
```

## 📝 Regras de Commit (Semantic Release)

Nós usamos Semantic Release e Conventional Commits. A sua mensagem de commit **deve** seguir este formato para que o pipeline aceite:

`<tipo>(<escopo>): <descrição>`

Tipos mais usados:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `chore:` Manutenção, atualizações de build
- `docs:` Modificações apenas em arquivos `.md`
- `refactor:` Alterações de código que não adicionam feature nem corrigem bugs
- `test:` Adição de testes

*Exemplo:* `feat(request): adiciona suporte a formato graphql`

## 📬 Abrindo o Pull Request

1. Sincronize sua branch com a `main` mais recente para evitar conflitos.
2. Faça o push para o seu Fork.
3. Abra o Pull Request e preencha todos os campos do nosso template.

O nosso **Pipeline de PR (GitHub Actions)** já está configurado para validar automaticamente seu código fazendo testes de Tipagem (TS), Linter e Testes Unitários de Cobertura Total. Caso algo quebre nessa Action, corrija os erros e faça push novamente na sua branch.

