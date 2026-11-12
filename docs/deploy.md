# Deploy com Docker Compose

[← Voltar ao README](../README.md)

O `docker-compose.yml` da raiz sobe a aplicação completa em três containers, pronta para um servidor, e um quarto container com o site da documentação.

| Serviço | Imagem                          | Papel                                                                  |
| ------- | ------------------------------- | ---------------------------------------------------------------------- |
| `db`    | `postgres:17-alpine`            | Banco de dados                                                         |
| `api`   | Construída de `api/Dockerfile`  | A API em Go                                                            |
| `web`   | Construída de `web/Dockerfile`  | O front, servido pelo nginx, que também repassa as chamadas para a API |
| `docs`  | Construída de `docs/Dockerfile` | O site da documentação (VitePress), servido pelo nginx em `/docs`      |

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

3. Acesse http://localhost:5000 no próprio servidor. Para acessar de fora, veja [Publicação com o Tailscale Funnel](#publicação-com-o-tailscale-funnel).

Sem o `.env`, o Compose não sobe e avisa qual variável está faltando.

## Como os serviços se conectam

- **O navegador só fala com o nginx.** O front é gerado com `VITE_API_URL=/api`, um caminho relativo. O navegador chama a API no mesmo endereço em que abriu o front, e o nginx repassa tudo que começa com `/api/` para o container da API. Por isso, a mesma imagem funciona em qualquer IP ou domínio, e não há chamadas de outra origem (o CORS não é necessário).
- **As portas só respondem no próprio servidor.** O front (5000), a API (3000) e a documentação (4000) são publicados apenas em `127.0.0.1`. O acesso de fora passa pelo Tailscale Funnel, que repassa cada caminho para a porta local certa. Assim, nada fica aberto na rede local sem passar por ele.
- **O banco só aceita conexões do próprio servidor.** A porta 5432 é publicada apenas em `127.0.0.1`, para o `make dev` conseguir usar o mesmo banco. Ela não fica acessível pela rede.
- **A API acessa o banco pelo nome do serviço** (`host=db`), com as credenciais do `.env`.

## Arquivos de cada imagem

**API** (`api/Dockerfile`): compila o binário num estágio com Go, e copia só o binário para uma imagem Alpine pequena. A API roda com um usuário sem privilégios de administrador.

**Front** (`web/Dockerfile`): gera o build estático com Node, e copia os arquivos para uma imagem com nginx. O `VITE_API_URL` é informado **no build**, porque o Vite escreve o valor dentro do JavaScript gerado. Para mudar o endereço da API, é preciso gerar a imagem de novo.

O `web/nginx.conf` também:

- entrega o `index.html` para as rotas do React Router (`/projects/new`, `/projects/:id/edit`), para elas não darem 404 ao recarregar a página;
- aceita uploads de até 6 MB (o padrão do nginx é 1 MB, e a API aceita capas de até 5 MB);
- guarda em cache os arquivos de `/assets/`, que têm um hash no nome e mudam a cada build.

**Documentação** (`docs/Dockerfile`): gera o site estático com o VitePress e copia os arquivos para uma imagem com nginx. O contexto do build é a raiz do repositório, porque o site usa o `README.md` como página inicial. O `docs/Dockerfile.dockerignore` faz o Docker enviar só o `README.md` e a pasta `docs/`, sem o código da API e do front. O `docs/nginx.conf` resolve as URLs sem extensão (`/deploy` → `deploy.html`). O site é gerado para o caminho `/docs` (o argumento `DOCS_BASE`), e fica em http://localhost:4000/docs/. O nginx aceita os endereços com e sem o prefixo `/docs`, porque o Funnel tira o prefixo antes de repassar. A porta é a mesma do `make docs`, então os dois não podem rodar ao mesmo tempo.

## Sempre no ar

Todos os serviços usam `restart: unless-stopped`: o Docker reinicia o container se ele cair, e sobe tudo de novo quando o próprio Docker iniciar (por exemplo, depois de reiniciar o servidor). Para isso, o Docker precisa iniciar com o sistema. No Linux:

```sh
sudo systemctl enable docker
```

Um container parado manualmente (`docker compose stop`) continua parado até um novo `docker compose up -d`.

Os logs de cada container ficam limitados a 3 arquivos de 10 MB, para não encher o disco.

## Dados

| Volume         | Conteúdo             |
| -------------- | -------------------- |
| `db-data`      | Os dados do Postgres |
| `uploads-data` | As imagens de capa   |

Os volumes sobrevivem a atualizações e reinícios dos containers. Eles só são apagados com `docker compose down -v`.

Backup do banco:

```sh
docker compose exec db pg_dump -U <POSTGRES_USER> <POSTGRES_DB> > backup.sql
```

O Postgres só usa as credenciais do `.env` na **primeira** vez que o volume `db-data` é criado. Para trocar a senha depois, é preciso alterá-la dentro do banco, ou apagar o volume e começar do zero.

## Comandos do dia a dia

| Comando                                    | O que faz                                       |
| ------------------------------------------ | ----------------------------------------------- |
| `docker compose up -d --build`             | Sobe ou atualiza tudo, reconstruindo as imagens |
| `git pull && docker compose up -d --build` | Publica uma nova versão do código               |
| `docker compose ps`                        | Mostra o estado dos containers                  |
| `docker compose logs -f api`               | Acompanha os logs da API                        |
| `docker compose stop api web`              | Para a API e o front, e mantém o banco no ar    |

## Desenvolvimento e Compose ao mesmo tempo

O Compose e o `make dev` usam as mesmas portas (5000 para o front e 3000 para a API), então os dois não podem rodar juntos. Para desenvolver com a aplicação do Compose no ar, pare o front e a API em container antes:

```sh
docker compose stop api web
make dev
```

As capas enviadas pelo `make dev` ficam em `api/uploads`, e as enviadas pelo Compose ficam no volume `uploads-data`. Como os dois modos usam o mesmo banco, um projeto com capa criado num modo aparece sem a imagem no outro.

## Publicação com o Tailscale Funnel

A aplicação é publicada na internet pelo [Tailscale Funnel](https://tailscale.com/kb/1223/funnel), sem abrir portas no roteador. O Funnel recebe as requisições num endereço público com HTTPS, `https://<maquina>.<tailnet>.ts.net`, e repassa cada caminho para uma porta local do servidor:

| Caminho público | Porta local | Serviço |
| --------------- | ----------- | ------- |
| `/`             | 5000        | `web`   |
| `/docs`         | 4000        | `docs`  |
| `/api`          | 3000        | `api`   |

```
navegador ──► Tailscale Funnel (HTTPS, porta 443)
                ├── /        ──► web  (127.0.0.1:5000)
                ├── /docs    ──► docs (127.0.0.1:4000)
                └── /api     ──► api  (127.0.0.1:3000) ──► db:5432
```

O Funnel tira o prefixo do caminho antes de repassar: `/api/project` chega à API como `/project`. Como o front chama a API em `/api`, o mesmo endereço do front, o navegador não faz chamadas de outra origem, e o CORS continua desnecessário.

### Pré-requisitos

- O Tailscale instalado e conectado no servidor.
- No [painel do Tailscale](https://login.tailscale.com/admin/dns), o **MagicDNS** e os **HTTPS Certificates** ativados.
- O Funnel liberado para a máquina na política de acesso. Na primeira vez que o comando abaixo roda, o próprio CLI mostra o link para liberar.

### Configurando

Com os containers no ar:

```sh
sudo tailscale funnel --bg 5000
sudo tailscale funnel --bg --set-path /docs 4000
sudo tailscale funnel --bg --set-path /api 3000
tailscale funnel status
```

O `--bg` deixa a configuração salva: ela continua valendo depois de reiniciar o servidor ou o Tailscale. O `tailscale funnel status` mostra o endereço público.

### Conferindo

```sh
curl https://<maquina>.<tailnet>.ts.net/api/project      # a lista de projetos, em JSON
curl -I https://<maquina>.<tailnet>.ts.net/docs/deploy   # 200
```

Depois, abra o front no navegador e crie um projeto com capa, o que passa pelo front, pela API e pelo upload.

### Desligando

```sh
sudo tailscale funnel reset
```

A aplicação não tem login: com o Funnel ligado, qualquer pessoa com o endereço pode criar e remover projetos. Ele deve ficar ligado só enquanto a aplicação precisar estar pública.
