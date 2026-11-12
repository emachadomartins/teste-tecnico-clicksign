# Deploy com Docker Compose

[← Voltar ao README](../README.md)

O `docker-compose.yml` da raiz sobe a aplicação completa em três containers, pronta para um servidor.

| Serviço | Imagem | Papel |
|---|---|---|
| `db` | `postgres:17-alpine` | Banco de dados |
| `api` | Construída de `api/Dockerfile` | A API em Go |
| `web` | Construída de `web/Dockerfile` | O front, servido pelo nginx, que também repassa as chamadas para a API |

```
navegador ──► web (nginx, porta 5000)
                ├── /        arquivos do front
                └── /api/*   repassado para a api:3000 ──► db:5432
```

## Subindo pela primeira vez

1. Crie o `.env` da raiz com as credenciais do banco, e troque a senha:

   ```sh
   cp .env.example .env
   ```

2. Construa as imagens e suba os containers:

   ```sh
   docker compose up -d --build
   ```

3. Acesse http://localhost:5000, ou `http://<ip-do-servidor>:5000` de outra máquina.

Sem o `.env`, o Compose não sobe e avisa qual variável está faltando.

## Como os serviços se conectam

- **O navegador só fala com o nginx.** O front é gerado com `VITE_API_URL=/api`, um caminho relativo. O navegador chama a API no mesmo endereço em que abriu o front, e o nginx repassa tudo que começa com `/api/` para o container da API. Por isso, a mesma imagem funciona em qualquer IP ou domínio, e não há chamadas de outra origem (o CORS não é necessário).
- **A API não é exposta.** Ela não publica nenhuma porta: só o nginx a acessa, pela rede interna do Compose.
- **O banco só aceita conexões do próprio servidor.** A porta 5432 é publicada apenas em `127.0.0.1`, para o `make dev` conseguir usar o mesmo banco. Ela não fica acessível pela rede.
- **A API acessa o banco pelo nome do serviço** (`host=db`), com as credenciais do `.env`.

## Arquivos de cada imagem

**API** (`api/Dockerfile`): compila o binário num estágio com Go, e copia só o binário para uma imagem Alpine pequena. A API roda com um usuário sem privilégios de administrador.

**Front** (`web/Dockerfile`): gera o build estático com Node, e copia os arquivos para uma imagem com nginx. O `VITE_API_URL` é informado **no build**, porque o Vite escreve o valor dentro do JavaScript gerado. Para mudar o endereço da API, é preciso gerar a imagem de novo.

O `web/nginx.conf` também:
- entrega o `index.html` para as rotas do React Router (`/projects/new`, `/projects/:id/edit`), para elas não darem 404 ao recarregar a página;
- aceita uploads de até 6 MB (o padrão do nginx é 1 MB, e a API aceita capas de até 5 MB);
- guarda em cache os arquivos de `/assets/`, que têm um hash no nome e mudam a cada build.

## Sempre no ar

Os três serviços usam `restart: unless-stopped`: o Docker reinicia o container se ele cair, e sobe tudo de novo quando o próprio Docker iniciar (por exemplo, depois de reiniciar o servidor). Para isso, o Docker precisa iniciar com o sistema. No Linux:

```sh
sudo systemctl enable docker
```

Um container parado manualmente (`docker compose stop`) continua parado até um novo `docker compose up -d`.

Os logs de cada container ficam limitados a 3 arquivos de 10 MB, para não encher o disco.

## Dados

| Volume | Conteúdo |
|---|---|
| `db-data` | Os dados do Postgres |
| `uploads-data` | As imagens de capa |

Os volumes sobrevivem a atualizações e reinícios dos containers. Eles só são apagados com `docker compose down -v`.

Backup do banco:

```sh
docker compose exec db pg_dump -U <POSTGRES_USER> <POSTGRES_DB> > backup.sql
```

O Postgres só usa as credenciais do `.env` na **primeira** vez que o volume `db-data` é criado. Para trocar a senha depois, é preciso alterá-la dentro do banco, ou apagar o volume e começar do zero.

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `docker compose up -d --build` | Sobe ou atualiza tudo, reconstruindo as imagens |
| `git pull && docker compose up -d --build` | Publica uma nova versão do código |
| `docker compose ps` | Mostra o estado dos containers |
| `docker compose logs -f api` | Acompanha os logs da API |
| `docker compose stop api web` | Para a API e o front, e mantém o banco no ar |

## Desenvolvimento e Compose ao mesmo tempo

O front do Compose e o do `make dev` usam a mesma porta, a 5000, então os dois não podem rodar juntos. Para desenvolver com a aplicação do Compose no ar, pare o front e a API em container antes:

```sh
docker compose stop api web
make dev
```

As capas enviadas pelo `make dev` ficam em `api/uploads`, e as enviadas pelo Compose ficam no volume `uploads-data`. Como os dois modos usam o mesmo banco, um projeto com capa criado num modo aparece sem a imagem no outro.

## Exposição na internet

O Compose serve a aplicação por HTTP, na porta 5000. Para um servidor acessado pela internet, coloque um proxy com HTTPS na frente (por exemplo, o [Caddy](https://caddyserver.com), que gera e renova os certificados sozinho), e libere no firewall apenas as portas desse proxy.
