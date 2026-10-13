# Guia de Testes de API do Trex-Http-Client (`tx.*` / `pm.*`)

O **Trex-Http-Client** permite escrever scripts JavaScript de pós-resposta para validar contratos HTTP, campos do payload, tempos de resposta e extrair automaticamente valores para variáveis de ambiente reutilizáveis.

O objeto nativo do Trex é **`tx`** (`tx.test`, `tx.expect`, `tx.response`, `tx.environment`). Por conveniência e compatibilidade direta com scripts migrados do Postman, o alias **`pm`** também é suportado de forma idêntica.

---

## 1. Onde escrever os testes

Na aba da requisição ativa:
1. Abra a sub-aba **Testes** (ao lado de Params, Headers, Auth, Body).
2. Escreva seu código de validação JavaScript ou utilize os **Snippets Rápidos** na barra lateral direita.
3. Clique em **Enviar**.
4. Após o recebimento da resposta, o painel inferior exibirá a aba **Testes (X/Y)** com o resultado detalhado de cada teste e as variáveis atualizadas.

---

## 2. APIs Globais Disponíveis no Script (`tx.*` e `pm.*`)

O objeto `tx` (ou `pm`) é injetado automaticamente e fornece o contexto seguro da execução.

### 2.1. `tx.test(name, fn)` (ou `pm.test`)
Registra e executa uma asserção de teste. Se um teste falhar ou lançar exceção, os demais continuam sendo executados normalmente.

```javascript
tx.test("Status code é 200", () => {
  tx.response.to.have.status(200);
});
```

### 2.2. `tx.response` (ou `pm.response`)
Objeto de inspeção da resposta HTTP recebida.

- `tx.response.status`: Código numérico de status HTTP (ex: `200`, `404`).
- `tx.response.statusText`: Mensagem de status HTTP (ex: `"OK"`).
- `tx.response.responseTime`: Tempo total da requisição em milissegundos.
- `tx.response.headers`: Objeto chave-valor com os headers da resposta.
- `tx.response.text()`: Retorna o corpo da resposta em texto puro.
- `tx.response.json()`: Faz o parse seguro do corpo para objeto ou lista JavaScript. Se não for JSON válido, lança erro explicativo.
- `tx.response.to.have.status(code)`: Atalho fluente de asserção para verificar o status HTTP esperado.

### 2.3. `tx.expect(target)` (ou `pm.expect`)
Biblioteca de asserções fluentes no estilo BDD / Chai.

Encadeamentos suportados:
- `.to.equal(value)` / `.to.eql(value)`: Comparação de valor (inclui comparação estrutural profunda de objetos e arrays).
- `.to.be.a(type)`: Validação de tipo (`"string"`, `"number"`, `"boolean"`, `"object"`, `"array"`, `"null"`, etc.).
- `.to.be.true` / `.to.be.false`: Validação booleana.
- `.to.be.empty`: Verifica se string, array ou objeto está vazio, ou se o valor é nulo/indefinido.
- `.to.have.property(key, optionalValue?)`: Verifica se o objeto possui uma propriedade (e opcionalmente o valor correspondente).
- `.to.have.lengthOf(length)`: Verifica o tamanho de strings ou arrays.
- `.to.include(item)`: Verifica se a string contém uma substring ou se o array contém o item informado.
- `.not`: Inverte a condição de asserção (ex: `tx.expect(x).to.not.be.empty`).

### 2.4. `tx.environment` (ou `pm.environment`)
Gerenciamento reativo de variáveis no ambiente atualmente selecionado.

- `tx.environment.get(key)`: Lê o valor atual de uma variável do ambiente ativo.
- `tx.environment.set(key, value)`: Define ou atualiza uma variável no ambiente ativo. A variável é persistida automaticamente e fica pronta para uso em tokens `{{chave}}` nas próximas requisições.

---

## 3. Exemplos Práticos

### Validar Status e Tempo de Resposta
```javascript
tx.test("Status é 200 OK", () => {
  tx.response.to.have.status(200);
});

tx.test("Tempo de resposta menor que 500ms", () => {
  tx.expect(tx.response.responseTime < 500).to.be.true;
});
```

### Validar Estrutura de Lista (Array) e Propriedades de Itens
```javascript
tx.test("Resposta é uma lista com itens válidos", () => {
  const posts = tx.response.json();

  tx.expect(posts).to.be.a("array");
  tx.expect(posts).to.have.lengthOf(100);

  tx.expect(posts[0]).to.have.property("userId");
  tx.expect(posts[0].userId).to.be.a("number");
  tx.expect(posts[0].userId).to.equal(1);
});
```

### Extrair e Salvar Token de Autenticação para Próximas Requisições
```javascript
tx.test("Login efetuado e token extraído", () => {
  tx.response.to.have.status(200);

  const res = tx.response.json();
  tx.expect(res.access_token).to.be.a("string");
  tx.expect(res.access_token).to.not.be.empty;

  tx.environment.set("token", res.access_token);
  tx.environment.set("userId", String(res.user.id));
});
```

Nas requisições seguintes, basta configurar:
```
Authorization: Bearer {{token}}
URL: https://api.exemplo.com/users/{{userId}}
```

Nas requisições seguintes, basta configurar:
```
Authorization: Bearer {{token}}
URL: https://api.exemplo.com/users/{{userId}}
```

---

## 4. Segurança e Isolamento

- A execução dos scripts ocorre em um sandbox estrito de escopo limitado.
- O acesso a globais perigosos da janela/DOM (`window`, `document`, `localStorage`, `fetch`, `XMLHttpRequest`, `eval`, etc.) é bloqueado.
- Laços e chamadas possuem proteção contra loops infinitos por limite de tempo de execução (timeout de 2000ms).
- Falhas em um bloco de teste individual não interrompem a execução dos demais testes do script.

