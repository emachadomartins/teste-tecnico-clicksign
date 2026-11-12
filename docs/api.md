# API

[← Voltar ao README](../README.md)

A API é REST, com JSON no corpo das requisições e das respostas. A única exceção é o envio de capa, que usa `multipart/form-data`.

## Endereço base

| Como a API está rodando | Endereço base |
|---|---|
| Desenvolvimento (`make dev`) | `http://localhost:3000` |
| Docker Compose completo | `http://localhost:5000/api` (o nginx do front repassa para a API) |

Todos os exemplos abaixo usam o endereço de desenvolvimento.

## Resumo das rotas

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/` | Verifica se a API está no ar |
| `GET` | `/project` | Lista projetos, com busca, filtro e ordenação |
| `POST` | `/project` | Cria um projeto |
| `GET` | `/project/{id}` | Busca um projeto |
| `PUT` | `/project/{id}` | Atualiza um projeto |
| `DELETE` | `/project/{id}` | Remove um projeto e a sua capa |
| `PATCH` | `/project/{id}/favorite` | Marca ou desmarca um projeto como favorito |
| `POST` | `/project/{id}/cover` | Envia ou substitui a capa do projeto |
| `GET` | `/project/{id}/cover` | Devolve a imagem da capa |

## Formato das respostas

As respostas em JSON seguem sempre o mesmo envelope:

```json
{
  "data": "...",
  "metadata": { "total": 2 },
  "error": "..."
}
```

| Campo | Quando aparece |
|---|---|
| `data` | Sempre. O projeto, a lista de projetos ou `null` em caso de erro |
| `metadata` | Só na listagem, com o `total` de itens devolvidos. É omitido quando a lista está vazia |
| `error` | Só em caso de erro, com a mensagem |

Exemplo de erro:

```json
{ "data": null, "error": "record not found" }
```

As rotas de remoção respondem `204 No Content`, sem corpo. A rota de leitura da capa responde com a própria imagem.

## O objeto projeto

```json
{
  "id": "1b34f8aa-9914-4d01-a43e-2ae9f2b346e9",
  "created_at": "2026-11-11T22:54:02.84759Z",
  "updated_at": "2026-11-11T23:05:55.740286Z",
  "name": "Etanol Cachaça Pinga Reactor 4",
  "client": "Luis Inacio",
  "is_favorite": false,
  "initial_date": "2026-11-18",
  "final_date": "2026-11-23",
  "cover_url": "1b34f8aa-9914-4d01-a43e-2ae9f2b346e9.png"
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador, gerado pela API |
| `created_at`, `updated_at` | data e hora (RFC 3339) | Preenchidos pela API |
| `name` | texto | Nome do projeto |
| `client` | texto | Nome do cliente |
| `is_favorite` | booleano | Se o projeto é favorito. Começa como `false` |
| `initial_date`, `final_date` | data (`YYYY-MM-DD`) | Datas de início e de término, sem horário |
| `cover_url` | texto, opcional | Nome do arquivo da capa. Só aparece quando o projeto tem capa. Para obter a imagem, use `GET /project/{id}/cover` |

As datas de início e término usam sempre o formato `YYYY-MM-DD`, tanto na entrada quanto na saída. Qualquer outro formato é recusado.

## Rotas

### `GET /`

Verifica se a API está no ar.

**Resposta:** `200 OK`, com o texto `Server is running`.

---

### `GET /project`

Lista os projetos.

**Parâmetros de query** (todos opcionais):

| Parâmetro | Valores | Descrição |
|---|---|---|
| `term` | texto | Busca por palavras. Cada palavra precisa aparecer no nome **ou** no cliente. A busca ignora maiúsculas e acentos: `cachaca` encontra "Cachaça" |
| `favorites_only` | `true` | Devolve só os favoritos |
| `sort_by` | `name`, `initial_date`, `final_date` | Ordenação (veja abaixo). Padrão: `name` |

| `sort_by` | Ordem |
|---|---|
| `name` | Alfabética pelo nome (padrão) |
| `initial_date` | Data de início, da mais recente para a mais antiga (iniciados mais recentemente) |
| `final_date` | Data de término, da mais próxima para a mais distante (prazo mais próximo) |

Um valor de `sort_by` desconhecido usa a ordenação por nome. Os filtros podem ser combinados.

**Exemplo:**

```sh
curl "http://localhost:3000/project?term=etanol%20pinga&favorites_only=true&sort_by=final_date"
```

**Resposta:** `200 OK`

```json
{
  "data": [
    { "id": "...", "name": "Etanol Cachaça Pinga Reactor 4", "...": "..." }
  ],
  "metadata": { "total": 1 }
}
```

Sem resultados, a resposta é `{ "data": [] }`, sem o `metadata`.

| Status | Quando |
|---|---|
| `200` | Sucesso, inclusive com a lista vazia |
| `500` | Falha ao consultar o banco |

---

### `POST /project`

Cria um projeto.

**Corpo:**

```json
{
  "name": "Projeto Exemplo",
  "client": "Cliente Exemplo",
  "initial_date": "2026-11-20",
  "final_date": "2026-11-30"
}
```

| Campo | Regra |
|---|---|
| `name` | Obrigatório, não pode ser vazio |
| `client` | Obrigatório, não pode ser vazio |
| `initial_date` | Obrigatório, no formato `YYYY-MM-DD` |
| `final_date` | Obrigatório, no formato `YYYY-MM-DD`, e não pode ser antes da `initial_date` |

O projeto é criado como não favorito e sem capa. A capa é enviada depois, pela rota `POST /project/{id}/cover`.

**Resposta:** `201 Created`, com o projeto criado em `data`.

| Status | Quando |
|---|---|
| `201` | Projeto criado |
| `400` | O corpo não é um JSON válido, ou uma data está fora do formato `YYYY-MM-DD` |
| `500` | Um campo obrigatório está vazio, a data final é anterior à inicial, ou houve falha ao gravar no banco |

---

### `GET /project/{id}`

Busca um projeto pelo ID.

**Resposta:** `200 OK`, com o projeto em `data`.

| Status | Quando |
|---|---|
| `200` | Projeto encontrado |
| `400` | O ID não é um UUID válido |
| `404` | O projeto não existe |

---

### `PUT /project/{id}`

Atualiza os dados de um projeto. A atualização é **parcial**: os campos enviados substituem os atuais, e os omitidos continuam como estão.

**Corpo** (os mesmos campos da criação, todos opcionais):

```json
{
  "name": "Novo nome",
  "final_date": "2026-12-15"
}
```

Depois de aplicar as alterações, o projeto é validado com as mesmas regras da criação. Por exemplo, enviar só uma `final_date` anterior à `initial_date` já gravada é recusado.

Esta rota não altera o favorito nem a capa, que têm rotas próprias.

**Resposta:** `200 OK`, com o projeto atualizado em `data`.

| Status | Quando |
|---|---|
| `200` | Projeto atualizado |
| `400` | O ID não é um UUID válido |
| `404` | O projeto não existe, ou o resultado da alteração não passa na validação |

---

### `DELETE /project/{id}`

Remove o projeto e apaga o arquivo da capa, se houver.

**Resposta:** `204 No Content`, sem corpo.

| Status | Quando |
|---|---|
| `204` | Projeto removido |
| `400` | O ID não é um UUID válido |
| `404` | O projeto não existe |

---

### `PATCH /project/{id}/favorite`

Marca ou desmarca o projeto como favorito. O valor é informado explicitamente (e não invertido a cada chamada), então repetir a mesma requisição dá o mesmo resultado.

**Corpo:**

```json
{ "is_favorite": true }
```

| Campo | Regra |
|---|---|
| `is_favorite` | Obrigatório, booleano |

**Resposta:** `200 OK`, com o projeto atualizado em `data`.

| Status | Quando |
|---|---|
| `200` | Favorito atualizado |
| `400` | O ID não é um UUID válido, ou o `is_favorite` não foi enviado |
| `404` | O projeto não existe |

---

### `POST /project/{id}/cover`

Envia a imagem de capa do projeto. Se o projeto já tiver uma capa, ela é substituída.

**Corpo:** `multipart/form-data`, com o arquivo no campo `cover`.

```sh
curl -X POST http://localhost:3000/project/<id>/cover -F "cover=@capa.jpg"
```

| Regra | Detalhe |
|---|---|
| Tipos aceitos | JPEG e PNG |
| Tamanho máximo | 5 MB |
| Validação do tipo | Feita pelo **conteúdo** do arquivo (os primeiros bytes), e não pela extensão nem pelo `Content-Type` enviado. Um arquivo renomeado para `.jpg` que não seja uma imagem é recusado |
| Nome do arquivo salvo | Gerado pela API: o ID do projeto mais a extensão (`.jpg` ou `.png`). O nome do arquivo enviado é ignorado |

**Resposta:** `200 OK`, com o projeto atualizado em `data`, incluindo o `cover_url`.

| Status | Quando |
|---|---|
| `200` | Capa salva |
| `400` | O ID não é um UUID válido, o campo `cover` não foi enviado, ou o arquivo passa de 5 MB |
| `404` | O projeto não existe, ou o arquivo não é JPEG nem PNG |

---

### `GET /project/{id}/cover`

Devolve a imagem da capa do projeto.

**Resposta:** `200 OK`, com os bytes da imagem e o `Content-Type` correspondente (`image/jpeg` ou `image/png`).

O front acrescenta um parâmetro `?v=<cover_url>` a essa URL. A API ignora esse parâmetro. Ele serve só para o navegador baixar a imagem nova quando a capa é trocada, em vez de reaproveitar a antiga do cache.

| Status | Quando |
|---|---|
| `200` | Imagem devolvida |
| `400` | O ID não é um UUID válido |
| `404` | O projeto não existe, não tem capa, ou o arquivo não foi encontrado no disco |

## CORS

A API só aceita requisições do navegador vindas das origens listadas em `ALLOWED_ORIGINS` (por padrão, `http://localhost:5000` e `http://127.0.0.1:5000`). No Docker Compose completo, o front e a API ficam no mesmo endereço, e o CORS não é necessário.
