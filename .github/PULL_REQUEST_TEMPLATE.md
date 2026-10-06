## Descrição da Mudança
<!-- Descreva de forma clara o que o seu PR faz. -->
<!-- Explique o contexto, o problema resolvido ou a nova funcionalidade adicionada. -->


## Link para a Issue
<!-- Se houver uma Issue associada, linke-a aqui com "Closes #<numero>" -->
Closes #

## Checklist de Arquitetura e Qualidade
<!-- Marque os itens abaixo antes de solicitar a revisão (coloque um 'x' entre os colchetes) -->
<!-- PRs que não seguirem esse checklist não serão mesclados. -->

- [ ] Meu código compila perfeitamente e não contém NENHUM uso de `any`.
- [ ] Eu escrevi testes unitários cobrindo o novo comportamento e mantive a cobertura em 100%.
- [ ] Todo o meu código de interface `.vue` é "fino" (lógica delegada inteiramente para composables).
- [ ] A lógica de negócios e estado principal foi modelada 100% usando Classes OOP (Services/Repositories).
- [ ] Meu código **NÃO** possui comentários ou JSDoc explicando o que faz (o código é autoexplicativo).
- [ ] Eu executei `pnpm run lint` localmente e corrigi tudo.
- [ ] As minhas funções são todas Arrow Functions.
- [ ] A minha mensagem de commit segue as diretrizes do Semantic Release (ex: `feat:`, `fix:`).

