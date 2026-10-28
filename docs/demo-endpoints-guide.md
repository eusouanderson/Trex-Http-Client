# Guia de Endpoints Próprios & Demonstrações HTTP — Trex HTTP Client

O Trex HTTP Client conta com sua própria suíte de **Endpoints de Demonstração e Testes**, hospedados e acessíveis diretamente sob o domínio oficial do projeto no GitHub Pages (`https://eusouanderson.github.io/Trex-Http-Client/`).

Essa camada elimina a dependência de serviços externos de terceiros (como JSONPlaceholder), fornecendo um catálogo temático jurássico pré-histórico com total previsibilidade, suporte a cenários completos de autenticação, simulação de erros e respostas estruturadas para testes de automação e scripts `tx.*` / `pm.*`.

---

## 1. Visão Geral dos Endpoints

| Método | Caminho no GitHub Pages | Finalidade | Status Retornado |
| :---: | :--- | :--- | :---: |
| `GET` | `/get` (ou `/api/dinosaurs`) | Catálogo paleontológico com filtros, busca e paginação | `200 OK` |
| `POST` | `/post` | Cadastro e inclusão de novos espécimes fósseis no acervo | `201 Created` |
| `PUT` | `/put` | Atualização de registros de fósseis e dados taxonômicos | `200 OK` |
| `DELETE` | `/delete` | Remoção de registros do acervo paleontológico | `200 OK` |
| `GET` | `/auth/bearer` | Validação de autenticação via Token Bearer | `200 OK` / `401 Unauthorized` |
| `GET` | `/auth/basic` | Validação de autenticação via usuário e senha Basic Auth | `200 OK` / `401 Unauthorized` |
| `GET` | `/auth/api-key` | Validação de chave de acesso via header `X-API-Key` ou parâmetro `api_key` | `200 OK` / `403 Forbidden` |
| `GET` | `/status/:code` | Simulação dinâmica de qualquer código de status HTTP (ex: 404, 500) | `HTTP :code` |
| `GET` | `/delay/:ms` | Simulação controlada de latência de rede (até 5000ms) | `200 OK` |

---

## 2. Detalhamento dos Endpoints

### 2.1. `GET /get` — Consulta ao Acervo de Dinossauros
Retorna o acervo fóssil cadastrado no Trex com metadados de requisição espelhados no objeto `echo`.

- **URL:** `https://eusouanderson.github.io/Trex-Http-Client/get`
- **Parâmetros de Query Suportados:**
  - `diet`: Filtra por dieta (`Carnívoro`, `Herbívoro`, `Onívoro`).
  - `period`: Filtra por período geológico (ex: `Cretáceo`, `Jurássico`).
  - `search`: Busca textual por nome, período, localização fóssil ou periculosidade.
  - `limit`: Limita a quantidade de espécimes retornados.
  - `offset`: Deslocamento inicial para paginação.

#### Exemplo de Resposta (HTTP 200 OK):
```json
{
  "message": "🦖 Acervo Paleontológico Trex HTTP Client",
  "total": 6,
  "count": 2,
  "dinosaurs": [
    {
      "id": "dino-1",
      "name": "Tyrannosaurus Rex",
      "period": "Cretáceo Superior",
      "diet": "Carnívoro",
      "lengthMeters": 12.3,
      "weightKg": 8400,
      "fossilLocation": "América do Norte",
      "dangerLevel": "Extremo"
    },
    {
      "id": "dino-2",
      "name": "Spinosaurus",
      "period": "Cretáceo Superior",
      "diet": "Carnívoro",
      "lengthMeters": 15.0,
      "weightKg": 7500,
      "fossilLocation": "Norte da África",
      "dangerLevel": "Extremo"
    }
  ],
  "echo": {
    "url": "https://eusouanderson.github.io/Trex-Http-Client/get?diet=Carnívoro&limit=2",
    "method": "GET",
    "params": {
      "diet": "Carnívoro",
      "limit": "2"
    },
    "headers": {
      "accept": "application/json"
    }
  },
  "timestamp": "2026-10-28T20:45:00.000Z"
}
```

---

### 2.2. `POST /post` — Registro de Novo Espécime
Cria um novo fóssil no acervo gerando identificador único `dino-*` e retornando status `201 Created`.

- **URL:** `https://eusouanderson.github.io/Trex-Http-Client/post`
- **Headers Recomendados:** `Content-Type: application/json`
- **Exemplo de Body:**
```json
{
  "name": "Spinosaurus Aegyptiacus",
  "period": "Cretáceo",
  "diet": "Carnívoro",
  "lengthMeters": 15.2,
  "weightKg": 7600,
  "fossilLocation": "Egito",
  "dangerLevel": "Extremo"
}
```

#### Exemplo de Resposta (HTTP 201 Created):
```json
{
  "success": true,
  "message": "Espécime fóssil registrado com sucesso no acervo do Trex",
  "data": {
    "id": "dino-1730148300000-abcd",
    "name": "Spinosaurus Aegyptiacus",
    "period": "Cretáceo",
    "diet": "Carnívoro",
    "lengthMeters": 15.2,
    "weightKg": 7600,
    "fossilLocation": "Egito",
    "dangerLevel": "Extremo"
  },
  "timestamp": "2026-10-28T20:45:00.000Z"
}
```

---

### 2.3. `PUT /put` — Atualização de Espécime Fóssil
Atualiza as propriedades taxonômicas de um espécime identificado pelo campo `id` ou query `?id=dino-1`.

- **URL:** `https://eusouanderson.github.io/Trex-Http-Client/put`
- **Exemplo de Body:**
```json
{
  "id": "dino-1",
  "weightKg": 8900,
  "fossilLocation": "Hell Creek Formation, Montana, EUA"
}
```

#### Exemplo de Resposta (HTTP 200 OK):
```json
{
  "success": true,
  "message": "Espécime fóssil atualizado com sucesso no acervo do Trex",
  "data": {
    "id": "dino-1",
    "name": "Tyrannosaurus Rex",
    "period": "Cretáceo Superior",
    "diet": "Carnívoro",
    "lengthMeters": 12.3,
    "weightKg": 8900,
    "fossilLocation": "Hell Creek Formation, Montana, EUA",
    "dangerLevel": "Extremo"
  },
  "timestamp": "2026-10-28T20:45:00.000Z"
}
```

---

### 2.4. `DELETE /delete` — Exclusão de Registro
Simula a baixa de um espécime no acervo.

- **URL:** `https://eusouanderson.github.io/Trex-Http-Client/delete?id=dino-2`
- **Exemplo de Resposta (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Registro de espécime fóssil removido do acervo com sucesso",
  "echo": {
    "url": "https://eusouanderson.github.io/Trex-Http-Client/delete?id=dino-2",
    "method": "DELETE",
    "params": {
      "id": "dino-2"
    }
  },
  "timestamp": "2026-10-28T20:45:00.000Z"
}
```

---

### 2.5. Cenários de Autenticação

#### A. Bearer Token (`GET /auth/bearer`)
- **Autenticado com Sucesso (HTTP 200 OK):**
  - **Header:** `Authorization: Bearer seu_token_aqui`
  - **Resposta:**
    ```json
    {
      "authenticated": true,
      "authType": "bearer",
      "user": "Paleontologista Chefe",
      "tokenMasked": "seu_***ui",
      "timestamp": "2026-10-28T20:45:00.000Z"
    }
    ```
- **Sem Token ou Inválido (HTTP 401 Unauthorized):**
  - **Resposta:**
    ```json
    {
      "authenticated": false,
      "authType": "bearer",
      "error": "Não autorizado: Token Bearer ausente ou inválido",
      "requiredHeader": "Authorization: Bearer <seu_token>",
      "timestamp": "2026-10-28T20:45:00.000Z"
    }
    ```

#### B. Basic Auth (`GET /auth/basic`)
- **Autenticado com Sucesso (HTTP 200 OK):**
  - **Header:** `Authorization: Basic <base64(usuario:senha)>`
  - **Resposta:**
    ```json
    {
      "authenticated": true,
      "authType": "basic",
      "user": "usuario",
      "timestamp": "2026-10-28T20:45:00.000Z"
    }
    ```
- **Credenciais Ausentes (HTTP 401 Unauthorized):**
  - **Resposta:**
    ```json
    {
      "authenticated": false,
      "authType": "basic",
      "error": "Não autorizado: Credenciais Basic Auth ausentes ou inválidas",
      "requiredHeader": "Authorization: Basic <base64>",
      "timestamp": "2026-10-28T20:45:00.000Z"
    }
    ```

#### C. API Key (`GET /auth/api-key`)
- **Autenticado com Sucesso (HTTP 200 OK):**
  - **Header:** `X-API-Key: chave_secreta_trex` (ou query parameter `?api_key=chave_secreta_trex`)
  - **Resposta:**
    ```json
    {
      "authenticated": true,
      "authType": "api-key",
      "user": "Acesso Autorizado via Chave",
      "apiKeyMasked": "ch***ex",
      "timestamp": "2026-10-28T20:45:00.000Z"
    }
    ```
- **Chave Ausente (HTTP 403 Forbidden):**
  - **Resposta:**
    ```json
    {
      "authenticated": false,
      "authType": "api-key",
      "error": "Acesso Proibido: Chave de API ausente ou inválida",
      "requiredHeader": "X-API-Key",
      "timestamp": "2026-10-28T20:45:00.000Z"
    }
    ```

---

### 2.6. Simulação de Status e Latência

- **`/status/:code` (ex: `/status/404`, `/status/500`, `/status/418`):**
  - Retorna exatamente o status HTTP informado na URL acompanhado de mensagem descritiva formatada em JSON.
- **`/delay/:ms` (ex: `/delay/800`):**
  - Retorna status `200 OK` após aguardar propositalmente o tempo em milissegundos solicitado, ideal para validar estados de loading, spinners de interface e cancelamentos de requisição.

---

## 3. Automação e Validação via Test Scripts (`tx.*` / `pm.*`)

Os endpoints foram projetados para serem validados diretamente pelo executor de testes pós-resposta do Trex:

```javascript
tx.test("Status code é 200 OK", () => {
  tx.expect(tx.response.status).toBe(200);
});

tx.test("Lista de dinossauros é retornada com dados válidos", () => {
  const json = tx.response.json();
  tx.expect(json.dinosaurs.length).toBeGreaterThan(0);
  tx.expect(json.dinosaurs[0].name).toBe("Tyrannosaurus Rex");
});

tx.test("Header x-powered-by é do motor do Trex", () => {
  tx.expect(tx.response.headers["x-powered-by"]).toBe("Trex HTTP Client Engine");
});
```

---

## 4. Arquitetura e Engenharia de Software

Toda a lógica dos endpoints de demonstração está isolada no módulo de infraestrutura do Trex em `src/core/endpoints/`:

- **`DemoEndpointEntity` (`demo-endpoint.entity.ts`):** Entidade pura responsável pelo estado dos espécimes fósseis, filtragem por dieta/período, paginação e mutações em memória.
- **`DemoEndpointService` (`demo-endpoint.service.ts`):** Serviço responsável pelo matching de rotas (`/get`, `/post`, `/put`, `/delete`, `/auth/*`, `/status/*`, `/delay/*`) e geração de objetos `Response` em conformidade com a especificação Fetch API.
- **Integração Transparente (`RequestRunnerService`):** O client HTTP intercepta as chamadas locais sem requisições de rede externas desnecessárias, assegurando funcionamento 100% offline, zero dependências de servidores pagos e total conformidade com o GitHub Pages.

