# Gerenciador de Projetos

Aplicação para cadastrar e acompanhar projetos: listar, buscar, criar, editar, remover e favoritar, com uma imagem de capa opcional para cada projeto.

O repositório tem duas aplicações independentes:

| Pasta | O que é | Stack |
|---|---|---|
| [`api/`](api) | API REST que guarda os projetos e as capas | Go, chi, GORM, PostgreSQL |
| [`web/`](web) | Interface web | React, TypeScript, Vite, React Router |

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/api.md](docs/api.md) | Todas as rotas da API, com parâmetros, payloads, respostas e códigos de status |
| [docs/backend.md](docs/backend.md) | Estrutura de pastas da API, camadas, busca, armazenamento de capas e dependências |
| [docs/frontend.md](docs/frontend.md) | Estrutura de pastas do front, páginas, componentes, hooks e dependências |
| [docs/deploy.md](docs/deploy.md) | Como publicar a aplicação completa com Docker Compose |

## Como funciona

O usuário usa o front no navegador. O front conversa com a API por HTTP e JSON, e a API guarda os dados no PostgreSQL e as imagens de capa em disco.

```
Navegador ──► web (React) ──HTTP/JSON──► api (Go) ──► PostgreSQL
                                             └──────► pasta de uploads (capas)
```

Principais funcionalidades:

- **Listagem** com o total de projetos, um estado próprio para quando não há nenhum projeto, filtro de favoritos e três ordenações (alfabética, iniciados mais recentemente e prazo mais próximo).
- **Busca** pela barra da top-bar, por nome do projeto ou do cliente, sem diferenciar maiúsculas nem acentos. As palavras buscadas aparecem destacadas nos resultados, e as últimas 5 buscas ficam salvas como sugestão.
- **Formulários** de criação e edição, com validação dos campos e envio de uma imagem de capa (JPG ou PNG, até 5 MB).
- **Remoção** com um modal de confirmação.
- **Favoritos** marcados direto no card do projeto.

Os filtros da listagem (busca, favoritos e ordenação) ficam na URL, por exemplo `/?term=etanol&favorites_only=true&sort_by=final_date`. A lista filtrada sobrevive a um recarregamento da página e pode ser compartilhada por link.

## Rodando em desenvolvimento

### Pré-requisitos

- [Go](https://go.dev/dl/) 1.27.3 ou superior
- [Node.js](https://nodejs.org/) 22 ou superior
- [Docker](https://docs.docker.com/get-docker/) com o Docker Compose, para o banco
- `make`

### Passo a passo

1. **Crie os arquivos de ambiente** a partir dos exemplos:

   ```sh
   cp .env.example .env          # credenciais do Postgres (docker compose)
   cp api/.env.example api/.env  # configuração da API
   cp web/.env.example web/.env  # configuração do front
   ```

   A senha em `api/.env` (dentro do `DATABASE_URL`) precisa ser a mesma do `POSTGRES_PASSWORD` do `.env` da raiz.

2. **Instale as dependências do front:**

   ```sh
   cd web && npm install && cd ..
   ```

   As dependências do Go são baixadas automaticamente na primeira execução.

3. **Suba tudo:**

   ```sh
   make dev
   ```

   O comando sobe o Postgres no Docker, espera ele ficar pronto, e roda a API e o front lado a lado, os dois recarregando sozinhos quando um arquivo é salvo.

| Serviço | Endereço |
|---|---|
| Front | http://localhost:5000 |
| API | http://localhost:3000 |
| Postgres | `localhost:5432` |

Na primeira execução, a API cria a tabela de projetos e ativa a extensão `unaccent` do Postgres, usada pela busca.

### Comandos do Makefile

| Comando | O que faz |
|---|---|
| `make dev` | Sobe o banco e roda a API e o front em modo de desenvolvimento |
| `make db` | Sobe só o Postgres |
| `make api` | Roda só a API, com recarga automática ([Air](https://github.com/air-verse/air)) |
| `make web` | Roda só o front ([Vite](https://vite.dev/)) |
| `make stop` | Para os containers do compose (os dados continuam salvos) |
| `make test` | Roda os testes da API e do front |
| `make test-api` / `make test-web` | Roda os testes de um lado só |

## Variáveis de ambiente

| Arquivo | Variável | Para quê |
|---|---|---|
| `.env` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Credenciais do Postgres criado pelo Docker Compose |
| `api/.env` | `PORT` | Porta da API (padrão `8080`; o exemplo usa `3000`) |
| `api/.env` | `DATABASE_URL` | Conexão com o Postgres. Use `host=localhost` rodando na sua máquina e `host=db` dentro do Compose |
| `api/.env` | `UPLOADS_BASE_PATH` | Pasta onde as capas são salvas (padrão `uploads`) |
| `api/.env` | `ALLOWED_ORIGINS` | Origens liberadas no CORS, separadas por vírgula (o endereço do front) |
| `web/.env` | `VITE_API_URL` | Endereço da API, usado pelo navegador |
| `web/.env` | `VITE_PORT` | Porta do servidor de desenvolvimento do front (padrão `5000`) |

## Testes

```sh
make test
```

Os testes são de funções puras e rodam sem banco, sem rede e sem servidor no ar.

- **API** (`go test`): normalização da busca, extensão de arquivos, o tipo `Date` (JSON e banco), validação do projeto, ordenação e o armazenamento de capas (usando uma pasta temporária).
- **Front** ([Vitest](https://vitest.dev/)): destaque do termo buscado, formatação de datas, validação do formulário e conversão dos dados da API.

## Rodando a aplicação completa com Docker

Para subir o banco, a API e o front em containers, como num servidor:

```sh
docker compose up -d --build
```

A aplicação fica em http://localhost:5000, e a API é acessada pelo mesmo endereço, em `/api`. Esse modo usa a porta 5000, a mesma do front do `make dev`, então os dois não podem rodar ao mesmo tempo. Os detalhes estão em [docs/deploy.md](docs/deploy.md).

## Estrutura do repositório

```
.
├── api/                  API em Go (detalhes em docs/backend.md)
├── web/                  Front em React (detalhes em docs/frontend.md)
├── docs/                 Documentação
├── docker-compose.yml    Banco, API e front em containers
├── Makefile              Atalhos de desenvolvimento e testes
├── .env.example          Credenciais do Postgres para o Compose
└── CHECKLIST.md          Acompanhamento dos requisitos do teste
```
