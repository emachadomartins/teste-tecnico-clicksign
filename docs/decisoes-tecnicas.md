# Decisões técnicas

[← Voltar ao README](../README.md)

Este documento registra as principais decisões tomadas no projeto: o contexto de cada uma, a escolha feita, as alternativas consideradas e o custo da escolha.

## Sumário

| Área                                                   | Decisão                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| [API](#api)                                            | Go com chi, camadas handler → service → repository                          |
| [Banco de dados](#banco-de-dados)                      | PostgreSQL com GORM e `AutoMigrate`                                         |
| [Modelo de dados](#modelo-de-dados)                    | UUID gerado pela aplicação e um tipo próprio para datas                     |
| [Contrato da API](#contrato-da-api)                    | Envelope `{ data, metadata, error }` e campos em snake_case                 |
| [Atualização e favoritos](#atualização-e-favoritos)    | `PUT` parcial e uma rota própria, idempotente, para favoritar               |
| [Busca, filtro e ordenação](#busca-filtro-e-ordenação) | Feitos na API, palavra por palavra, sem diferenciar maiúsculas nem acentos  |
| [Capas dos projetos](#capas-dos-projetos)              | Disco local atrás de uma interface, enviadas numa segunda requisição        |
| [Front-end](#front-end)                                | React com Vite, React Router e TypeScript                                   |
| [Estado da listagem](#estado-da-listagem)              | Filtros guardados na URL                                                    |
| [Comunicação com a API](#comunicação-com-a-api)        | Uma camada própria sobre o `fetch`, sem biblioteca de cache                 |
| [Estado nos componentes](#estado-nos-componentes)      | Valores derivados em vez de estados sincronizados                           |
| [Componentes](#componentes)                            | Componentes próprios, incluindo o `<dialog>` nativo e um select feito à mão |
| [Estilos](#estilos)                                    | CSS puro por componente, com as cores em variáveis                          |
| [Testes](#testes)                                      | Testes unitários de funções puras, nos dois lados                           |
| [Organização do código](#organização-do-código)        | Dependências montadas num lugar só, hooks para os dados e imports com `@/`  |
| [Ambiente e deploy](#ambiente-e-deploy)                | Docker Compose num servidor próprio, publicado pelo Tailscale Funnel        |
| [Documentação](#documentação)                          | Markdown legível no GitHub e também publicado como site, com o VitePress    |

---

## API

### Go com chi

**Decisão:** a API usa o [chi](https://github.com/go-chi/chi) como roteador.

**Por quê:** o chi é compatível com o `net/http` da biblioteca padrão. Os handlers são `http.HandlerFunc` comuns, e o chi acrescenta só o que a biblioteca padrão não tem pronto: agrupamento de rotas (`Mount`) e middlewares, como o de CORS. O código continua sendo Go idiomático, sem depender de um contexto próprio do framework.

**Alternativas consideradas:**

- **Só a biblioteca padrão:** desde o Go 1.22, o `net/http` aceita método e parâmetro na rota. Seria suficiente para o número de rotas, mas exigiria escrever à mão o agrupamento e os middlewares.
- **Gin e Echo:** mais populares e com binding e validação por tags, mas com um contexto próprio (`gin.Context`, `echo.Context`), que acopla todo o código ao framework.
- **Fiber:** baseado no `fasthttp`, não é compatível com o ecossistema do `net/http`, e a diferença de desempenho não faz sentido para um CRUD.

### Camadas

**Decisão:** a API é dividida em `handler` (HTTP), `service` (regras de negócio), `repository` (banco) e `storage` (arquivos), dentro de `internal/`, com o ponto de entrada em `cmd/api`.

**Por quê:** cada camada tem uma responsabilidade e não conhece os detalhes das outras. O handler não sabe como os dados são guardados, e o service não sabe nada de HTTP. A pasta `internal/` impede, pelo próprio compilador, que outros módulos importem esses pacotes.

O `context` de cada requisição é repassado do handler até o GORM. Se o cliente cancelar a requisição, a query no banco também é cancelada.

**Alternativa considerada:** organizar por domínio (`internal/project/` com handler, service e repository juntos), que é bastante usada em Go. Com um único recurso (projetos), a divisão por camadas ficou mais simples de navegar, e as duas estruturas seriam equivalentes.

---

## Banco de dados

### PostgreSQL com GORM

**Decisão:** o banco é o PostgreSQL, acessado pelo [GORM](https://gorm.io).

**Por quê:** o GORM monta as queries a partir das structs, faz o mapeamento das linhas e cria a tabela. As queries dinâmicas da listagem (busca, filtro e ordenação opcionais) são montadas encadeando `Where` e `Order`, o que fica mais legível do que concatenar SQL à mão.

**Alternativas consideradas:**

- **pgx puro:** o driver mais completo para Postgres em Go, com SQL escrito à mão. Mais explícito e com menos "mágica", mas com mais código repetido para o mapeamento.
- **sqlc:** gera código Go tipado a partir de SQL. Excelente para queries fixas, mas desconfortável para a query dinâmica da listagem.

**Custo:** o GORM esconde parte do SQL gerado e tem comportamentos que pegam desprevenido. Por exemplo, o `Updates` com uma struct ignora campos com valor zero, como um `false`. Por isso, as atualizações de um campo só, como o favorito, usam o `Update("coluna", valor)`.

### `AutoMigrate`

**Decisão:** a tabela é criada pelo `AutoMigrate` do GORM quando a API inicia. A extensão `unaccent`, usada pela busca, é ativada no mesmo momento, com `CREATE EXTENSION IF NOT EXISTS`.

**Por quê:** há uma única tabela, e o `AutoMigrate` cria a tabela e acrescenta colunas novas sem nenhum arquivo extra. Subir a API já deixa o banco pronto.

**Custo:** o `AutoMigrate` não remove nem renomeia colunas, e não guarda um histórico das mudanças. Num projeto que continuasse evoluindo, o caminho seria migrations versionadas em SQL, com uma ferramenta como o [goose](https://github.com/pressly/goose).

---

## Modelo de dados

### UUID gerado pela aplicação

**Decisão:** o ID de cada projeto é um UUID (v4), gerado pela aplicação ao criar o model, e não pelo banco.

**Por quê:** o ID existe antes de o projeto ser gravado, o que deixa o model completo desde a criação e torna os testes independentes do banco. O UUID também evita que os IDs sejam previsíveis numa URL, como seria com um número sequencial.

**Próximo passo possível:** usar o UUID v7, que começa com o horário de criação. Ele mantém o índice da chave primária mais compacto à medida que a tabela cresce.

### Um tipo próprio para datas

**Decisão:** as datas de início e de término usam um tipo `model.Date`, e não o `time.Time`.

**Por quê:** o `time.Time` só aceita datas com horário no JSON (`2026-11-30T00:00:00Z`). As datas de um projeto são datas puras, e tratá-las como instantes abre espaço para o fuso horário mudar o dia. O `Date` aceita e devolve `YYYY-MM-DD` no JSON e grava como `date` no banco. O mesmo formato é usado pelo `<input type="date">` do front, então o valor passa da API para o formulário sem conversão.

---

## Contrato da API

### Envelope de resposta

**Decisão:** as respostas seguem o formato `{ data, metadata, error }`.

**Por quê:** o front lê toda resposta do mesmo jeito: o resultado em `data`, o total em `metadata` (na listagem) e a mensagem em `error` (nos erros). Isso permite que um único ponto do front (`api/client.ts`) trate todas as respostas.

### Erros com significado, traduzidos num lugar só

**Decisão:** as camadas devolvem erros que dizem o que aconteceu (`ErrNotFound`, `ErrNoCover`, `ValidationError`, `ErrInvalidContentType`), e uma única função do handler traduz cada um para o status HTTP (400, 404, 413 ou 500).

**Por quê:** o service não sabe nada de HTTP, e o status de cada situação é decidido num só lugar, igual em todas as rotas. Um erro de validação sempre vira 400, e um projeto inexistente sempre vira 404.

Os erros 500 respondem só com `internal server error`, e o detalhe vai para o log. Assim, mensagens internas, como as do banco, não chegam a quem chama a API.

### Campos em snake_case

**Decisão:** o JSON da API usa snake_case (`initial_date`, `is_favorite`). O front converte para camelCase num único lugar, as funções `toProject` e `toPayload`.

**Por quê:** cada lado segue a sua convenção, e o formato da API fica isolado no front. Se a API mudar o nome de um campo, só a função de conversão muda.

**Alternativa considerada:** a API devolver camelCase direto, o que eliminaria a conversão. Ficaria igualmente válido, e foi uma escolha de convenção.

---

## Atualização e favoritos

### `PUT` com atualização parcial

**Decisão:** o `PUT /project/{id}` aplica só os campos enviados. Os campos do payload são ponteiros, e um campo ausente (`nil`) mantém o valor atual.

**Por quê:** o formulário de edição e qualquer outro cliente podem enviar só o que mudou. Depois de aplicar as alterações, o projeto é validado inteiro, para que regras que comparam dois campos (a data final não pode ser antes da inicial) usem os valores já gravados.

**Custo:** pela semântica do HTTP, um `PUT` substitui o recurso inteiro, e uma atualização parcial seria um `PATCH`. Esse comportamento está descrito na [documentação das rotas](api.md).

### Uma rota própria para favoritar

**Decisão:** favoritar tem uma rota separada, `PATCH /project/{id}/favorite`, que recebe o valor desejado: `{ "is_favorite": true }`. A rota de edição não altera o favorito.

**Por quê:** favoritar é uma ação independente da edição dos dados do projeto, e com uma rota própria a intenção fica explícita. Enviar o valor, e não "inverter o atual", torna a operação **idempotente**: repetir a requisição dá o mesmo resultado.

**Alternativa considerada:** um toggle, sem corpo, que inverte o valor a cada chamada. Com o toggle, um clique duplo, uma nova tentativa automática ou duas abas abertas podem desfazer a ação. Com o valor explícito, o servidor sempre recebe o estado que a pessoa quer.

**No front:** a estrela muda na hora (atualização otimista), e a requisição é enviada em seguida.

---

## Busca, filtro e ordenação

### Feitos na API

**Decisão:** a busca, o filtro de favoritos e a ordenação são parâmetros da rota de listagem (`term`, `favorites_only` e `sort_by`), resolvidos pelo banco.

**Por quê:** o banco faz isso de forma eficiente, e o front deixa de precisar da lista completa para filtrar. A solução também continua funcionando se, no futuro, a listagem for paginada, o que não aconteceria com o filtro feito no front.

O `sort_by` recebido é convertido para uma das ordenações conhecidas, e o valor da requisição nunca entra direto no SQL. Um valor desconhecido usa a ordenação por nome.

### Busca palavra por palavra, sem acentos

**Decisão:** o termo é dividido em palavras, e cada palavra precisa aparecer no nome **ou** no cliente do projeto. A comparação ignora maiúsculas e acentos.

**Por quê:**

- **Palavra por palavra:** "projeto exemplo" encontra "Décimo Projeto de Exemplo", mesmo com outras palavras no meio e em outra ordem.
- **Nome ou cliente:** cada palavra pode estar em qualquer um dos dois, então "etanol acme" encontra o projeto "Etanol" do cliente "Acme".
- **Sem acentos:** "cachaca" encontra "Cachaça".

A normalização é aplicada aos **dois lados** da comparação: ao termo, no Go (com o `golang.org/x/text`), e às colunas, no Postgres (com `lower` e `unaccent`). Normalizar só o termo não funcionaria, porque o nome gravado no banco continuaria com acentos e letras maiúsculas.

**Alternativa considerada:** a busca textual completa do Postgres (`to_tsvector`). Ela entende plural e relevância, mas trabalha com palavras inteiras: buscar "Proj" não encontraria "Projeto". Para uma busca digitada por pessoas, o `LIKE` por palavra é mais previsível.

**Custo:** um `LIKE '%palavra%'` não usa os índices comuns. Para tabelas muito grandes, o próximo passo seria um índice com a extensão `pg_trgm`.

---

## Capas dos projetos

### Disco local atrás de uma interface

**Decisão:** as imagens são salvas em disco, por um `LocalStorage` que implementa uma interface `Storage` (`Save`, `Read` e `Delete`).

**Por quê:** é a opção mais simples para o escopo, sem depender de um serviço externo. A interface isola o resto do código desse detalhe: o service recebe um `storage.Storage`, e não o `LocalStorage`.

A linha `var _ Storage = (*LocalStorage)(nil)` faz o compilador conferir que o `LocalStorage` implementa a interface. Sem ela, uma assinatura diferente só seria percebida no ponto em que o `LocalStorage` fosse passado como `Storage`.

**Alternativas consideradas:**

- **Imagem em base64 no banco:** dispensa infraestrutura, mas aumenta o tamanho do banco e das respostas em cerca de 33%, e cada listagem carregaria as imagens inteiras.
- **Storage externo (S3, Cloudflare R2):** é o caminho certo para produção, porque sobrevive a novos deploys. Graças à interface, ele pode ser implementado como um `S3Storage`, sem mudar o service.

**Custo:** em plataformas de hospedagem com disco temporário, os arquivos se perdem a cada deploy. No Docker Compose, eles ficam num volume persistente.

### Segurança do upload

- **Validação pelo conteúdo:** o tipo do arquivo é detectado pelos primeiros bytes (`http.DetectContentType`), e não pela extensão nem pelo `Content-Type` enviado, que são definidos por quem envia.
- **Limite de tamanho:** 5 MB, aplicado com o `http.MaxBytesReader` antes de o arquivo ser lido.
- **Nome gerado pela API:** o arquivo é salvo com o ID do projeto e a extensão do tipo detectado. O nome enviado nunca é usado, o que impede que algo como `../../arquivo` grave fora da pasta.
- **Extensão previsível:** os tipos comuns têm uma extensão fixa (`image/jpeg` → `.jpg`). Sem isso, a extensão dependeria da tabela de tipos do sistema operacional, e um JPEG podia ser salvo como `.jfif`.

### Gravação em streaming

**Decisão:** o arquivo é copiado do upload para o disco em pedaços, com `io.Copy`, sem ser carregado inteiro na memória.

Para detectar o tipo, o storage lê os primeiros 512 bytes. Esses bytes são devolvidos ao fluxo com um `io.MultiReader`, e o arquivo é gravado inteiro. O storage funciona com qualquer `io.Reader`, inclusive os que não permitem voltar ao início.

### Envio numa segunda requisição

**Decisão:** o formulário salva o projeto com JSON e, se houver uma imagem nova, envia a capa numa segunda requisição, para `POST /project/{id}/cover`.

**Por quê:** as rotas de criação e edição continuam em JSON, com a validação de tipos que o JSON oferece, e a lógica de arquivos fica isolada numa rota própria.

**Alternativas consideradas:**

- **Uma requisição só, com `multipart/form-data`:** é atômica, mas faria a criação e a edição deixarem de aceitar JSON.
- **Upload antecipado, ao escolher a imagem:** comum com storage externo, mas deixa arquivos órfãos quando a pessoa desiste do formulário.

**Custo:** as duas requisições não são atômicas. Se o projeto for salvo e a capa falhar, o formulário mostra uma mensagem e continua aberto. Na criação, a URL passa para a edição do projeto recém-criado, para que uma nova tentativa atualize o projeto em vez de criar outro.

### A imagem servida por uma rota

**Decisão:** a imagem é servida por `GET /project/{id}/cover`, e não por uma pasta pública.

**Por quê:** a URL não depende de onde ou como o arquivo está guardado. Trocar o disco por um storage externo não muda a URL.

Como a URL é a mesma para um projeto mesmo depois de trocar a capa, o front acrescenta a data de atualização do projeto como versão (`?v=<updated_at>`). Trocar a capa atualiza o projeto, a URL muda, e o navegador baixa a imagem nova em vez de reaproveitar a antiga do cache.

**Custo:** a URL também muda quando outros dados do projeto são editados, como o nome, e a imagem é baixada de novo mesmo sem ter mudado. A alternativa seria gerar um nome de arquivo novo a cada upload e usar esse nome como versão: a URL só mudaria quando a imagem mudasse, mas o back precisaria apagar o arquivo anterior a cada troca.

---

## Front-end

### React, TypeScript e Vite

**Decisão:** o front é uma SPA em React com TypeScript, construída com o Vite, e com as rotas do React Router.

**Por quê:** o TypeScript pega erros de tipo e de contrato na compilação, e o Vite oferece um servidor de desenvolvimento rápido e um build de produção simples.

As rotas são filhas de um layout comum (`App`), que renderiza a top-bar e um `<Outlet />`. A top-bar fica igual em todas as páginas, e só o conteúdo muda.

A criação e a edição usam **a mesma página**, `ProjectForm`, que decide o modo pela presença de um `id` na URL.

---

## Estado da listagem

### Filtros guardados na URL

**Decisão:** a busca, o filtro de favoritos e a ordenação ficam na query string (`/?term=...&favorites_only=true&sort_by=final_date`), com o `useSearchParams`, e não em estados do React.

**Por quê:**

- **A busca fica na top-bar, e a listagem fica em outra página.** A top-bar escreve o termo na URL e a listagem lê da URL, sem que um componente precise conhecer o outro.
- **Os filtros sobrevivem a um recarregamento** da página e funcionam com o botão "voltar" do navegador.
- **A lista filtrada pode ser compartilhada** por link.

**Alternativas consideradas:** elevar o estado até o `App`, ou usar um Context. As duas exigiriam mais código só para levar o termo da top-bar até a listagem, e perderiam as três vantagens acima.

### O total de projetos

O título "Projetos (n)" mostra o total de projetos **cadastrados**, que não muda com o filtro de favoritos. Com o filtro ligado, a listagem faz duas requisições em paralelo: uma com o filtro (os cards) e outra sem (o total).

---

## Comunicação com a API

### Uma camada própria sobre o `fetch`

**Decisão:** os componentes nunca chamam o `fetch` direto. A função `request` (`api/client.ts`) é o único lugar que faz requisições, e o `projectsApi` (`api/project.ts`) tem uma função por rota.

**Por quê:** a URL base, os headers, a leitura do envelope e o tratamento de erro ficam num lugar só. Uma resposta de erro vira um `ApiError`, com o status e a mensagem da API, que o formulário pode mostrar.

### Sem biblioteca de cache

**Decisão:** os dados são buscados com `useEffect` e guardados com `useState`, sem uma biblioteca como o TanStack Query.

**Por quê:** para duas páginas e um recurso, a solução sem biblioteca é suficiente e mostra o que acontece por trás.

**Custo:** o TanStack Query traria cache, novas tentativas, o cancelamento automático de requisições antigas e a atualização da lista depois de uma mutação. Numa aplicação maior, ele seria o próximo passo.

---

## Estado nos componentes

### Valores derivados em vez de estados sincronizados

**Decisão:** valores que podem ser calculados a partir de outros não ganham um `useState` próprio. Eles são calculados a cada renderização.

Exemplos: a lista está vazia (`isEmpty`), os erros do formulário (`errors`), o formulário é válido (`isFormValid`), a capa a mostrar (`coverToShow`).

**Por quê:** um estado que copia outro precisa ser mantido sincronizado à mão, normalmente com um `useEffect`. Isso gera uma renderização extra e permite que, por um instante, a tela mostre os dois valores desencontrados. Calculado, o valor nunca fica desatualizado.

### Validação do formulário

**Decisão:** os erros são calculados por uma função pura, `validate` (em `utils/projectForm.ts`), a partir do estado do formulário. Cada erro só aparece depois que o campo foi visitado (`onBlur`).

**Por quê:** a regra fica testável sem renderizar o componente, e o formulário não abre com todos os campos em vermelho. A API valida as mesmas regras, porque a validação do front pode ser contornada.

---

## Componentes

| Componente      | Decisão                                                                                       | Por quê                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ConfirmDialog` | Usa o elemento nativo `<dialog>`, aberto com `showModal()`                                    | O navegador já cuida do fundo escurecido, de colocar o modal acima de todo o resto, de prender o foco dentro dele e de fechar com Esc                                                                    |
| `SortSelect`    | Um componente feito à mão, e não um `<select>`                                                | O `<select>` nativo não permite estilizar as opções de forma consistente entre navegadores, nem girar a seta quando a lista abre                                                                         |
| `CoverField`    | O campo de capa como um componente, com a prévia, a validação do arquivo e o botão de remover | A lógica da prévia (`URL.createObjectURL`, liberada ao trocar de imagem) fica isolada, e o formulário só recebe o arquivo escolhido ou o aviso de que a capa atual foi removida                          |
| `Button`        | Variantes `primary` e `secondary`, e um modo `isLink`, que gera um link com a mesma aparência | Os botões ficam iguais em todo o app, e o que navega continua sendo um link de verdade, que abre em nova aba                                                                                             |
| `Icon`          | Um mapa com os ícones usados, acessados pelo nome (`<Icon icon="trash" />`)                   | Só os ícones do mapa entram no bundle, e o nome é verificado pelo TypeScript. Quando o ícone é clicável, o `label` é obrigatório, porque um botão só com ícone precisa de um texto para leitores de tela |
| `FormInput`     | Aceita todos os atributos de um `<input>` nativo, além do `label` e do `error`                | Novos atributos (`min`, `max`, `onBlur`) funcionam sem mudar o componente                                                                                                                                |

### Elementos que navegam são links

O botão "Novo projeto" e o "Editar" do card são links (`<Link>`), mesmo com a aparência de botão. Assim, eles podem ser abertos em nova aba e são anunciados como links por leitores de tela. O `navigate()` do React Router só é usado quando a navegação é consequência de uma ação, como voltar para a listagem depois de salvar.

### Histórico de buscas no navegador

**Decisão:** as últimas 5 buscas ficam no `localStorage`.

**Por quê:** a aplicação não tem login, então o histórico é naturalmente por navegador. Só buscas com 3 ou mais caracteres entram no histórico, sem repetir termos.

---

## Estilos

### CSS puro, por componente

**Decisão:** cada componente e cada página tem o seu `styles.css`, sem framework de CSS.

**Por quê:** o design é próprio, e reproduzi-lo com CSS puro dá controle total sobre cada medida.

**Alternativas consideradas:** Tailwind ou CSS Modules. O Tailwind aceleraria o desenvolvimento, mas espalharia os valores do design pelo JSX. Os CSS Modules evitariam conflitos de nomes entre arquivos, um ganho pequeno para o tamanho do projeto.

### Cores em variáveis

**Decisão:** as cores são definidas uma única vez, como variáveis CSS no `:root` do `index.css`, com nomes que descrevem o papel de cada cor (`--color-primary`, `--color-danger`). Nos componentes TSX, as cores vêm do `theme.ts`, que aponta para as mesmas variáveis.

**Por quê:** nenhuma cor é escrita duas vezes, e mudar uma cor do app inteiro é mudar uma linha. As props de cor do `Icon` só aceitam os nomes do `theme.ts`, então o TypeScript recusa um valor hexadecimal escrito direto no componente.

### Datas sem fuso horário

As datas por extenso são formatadas com o `Intl.DateTimeFormat` em UTC. Uma data `YYYY-MM-DD` é interpretada pelo JavaScript como meia-noite em UTC, e, formatada no fuso do Brasil, apareceria como o dia anterior.

### Fonte junto com o app

A fonte do design vem do pacote `@fontsource`, e é servida pelo próprio app, sem depender do Google Fonts.

---

## Testes

**Decisão:** os testes são unitários e cobrem funções puras: no back, a normalização da busca, o tipo `Date`, a validação, a ordenação e o storage; no front, o destaque da busca, a formatação de datas, a validação do formulário e a conversão dos dados da API.

**Por quê:** essas funções concentram as regras com mais casos de borda, e os testes rodam em qualquer máquina, sem banco, rede ou navegador. Os testes de datas foram executados em três fusos horários diferentes, para garantir que não dependem do ambiente.

Os testes também protegem contra a volta de bugs já encontrados: o arquivo de capa gravado sem os primeiros 512 bytes, a extensão `.jfif` e a data exibida com um dia a menos.

**Próximo passo:** testes de integração dos handlers (com um banco de teste) e testes de componentes no front.

---

## Organização do código

Antes da entrega, o código passou por uma revisão com um critério principal: cada arquivo deve ter uma responsabilidade clara, e o código deve fazer o que esta documentação diz. As decisões abaixo saíram dessa revisão.

### Dependências montadas num lugar só

**Decisão:** o `router` cria o storage, o repository, o service e o handler, e passa cada um pronto para o próximo. Cada camada recebe as suas dependências no construtor (`NewProjectService(logger, repo, storage)`, `NewProjectHandler(service)`), em vez de criá-las por dentro.

**Por quê:** as dependências de cada camada ficam visíveis na assinatura do construtor, e trocar uma delas (um storage externo, um service falso num teste) é mudar uma linha no `router`. Antes, o handler criava o próprio service, e esse acoplamento só aparecia lendo a implementação.

### Páginas que só compõem

**Decisão:** as páginas não buscam dados diretamente. O carregamento fica em hooks (`useProjects` para a listagem e `useProject` para a edição), e as partes com lógica própria viraram componentes (`Switch`, `SortSelect`, `CoverField` e `ProjectFormFields`).

**Por quê:** a `ProjectList` e a `ProjectForm` tinham perto de 300 linhas cada, misturando carregamento, cancelamento de requisições, favoritar, remoção, o seletor de ordenação, a prévia da capa e o envio do formulário. Hoje, cada página monta as peças e cuida só do que é dela (o modal de remoção, os estados de carregamento e erro), e cada peça pode ser lida sozinha.

### O formulário nasce com os dados

**Decisão:** a `ProjectForm` carrega o projeto e só então renderiza o `ProjectFormFields`, com `key={id}`. O estado do formulário é criado já preenchido com os dados do projeto.

**Por quê:** a alternativa seria criar o formulário vazio e copiar os dados com um `useEffect` quando o projeto chegasse, o que é justamente o tipo de estado sincronizado à mão evitado no resto do app (ver [Estado nos componentes](#estado-nos-componentes)). A `key` faz o React recriar o formulário do zero ao trocar de projeto, sem resto do estado anterior.

### Tipos que dizem o que aceitam

**Decisão:** a ordenação tem um tipo próprio, `SortOption`, derivado da lista `SORT_OPTIONS` (`"name" | "initial_date" | "final_date"`), com a função `isSortOption` para validar o valor lido da URL.

**Por quê:** antes, a ordenação usava `keyof ProjectInput`, que funcionava porque os nomes coincidiam, mas dizia que qualquer campo do formulário (como `client`) era uma ordenação válida. Com o tipo próprio, o TypeScript recusa valores que a API não aceita, e o seletor e a validação usam a mesma lista.

### Imports com `@/`

**Decisão:** o alias `@/` aponta para `src/`, e cada pasta (`api`, `components`, `hooks`, `pages`, `types` e `utils`) tem um `index.ts` que reexporta o seu conteúdo:

```ts
import { ApiError, projectsApi } from "@/api";
import { Button, Icon } from "@/components";
```

Dentro de uma mesma pasta, os arquivos se importam pelo caminho relativo (`../Button`).

**Por quê:** os imports ficam curtos e não mudam quando um arquivo muda de pasta. A regra do caminho relativo evita imports circulares: se um componente importasse o `index.ts` da própria pasta, ele importaria a si mesmo de volta, e outro componente poderia chegar `undefined`, dependendo da ordem de carregamento.

**Custo:** o alias precisa ser configurado em dois lugares, no `tsconfig.app.json` (para o TypeScript) e no `vite.config.ts` (para o Vite e o Vitest).

### Sem sobras

Código sem uso foi removido, porque ele faz quem lê procurar um comportamento que não existe:

- o campo `Page` da resposta da listagem, que nunca era preenchido, porque não há paginação;
- a prop `confirmLabel` do `ConfirmDialog`, que o componente ignorava;
- os comentários que só repetiam o que o código já dizia;
- as classes CSS que nenhum componente usava.

### Lint e formatação

O `make lint` roda o `gofmt` e o `go vet` na API, e o [oxlint](https://oxc.rs) e o [Prettier](https://prettier.io) no front. O `make format` aplica a formatação nos dois. Assim, a formatação nunca é assunto de revisão, e o lint pega problemas como um `setState` dentro de um efeito.

---

## Ambiente e deploy

### Docker Compose

**Decisão:** o `docker-compose.yml` sobe o banco, a API e o front. As imagens são construídas em dois estágios: um para compilar e outro, menor, só com o resultado.

### O nginx serve o front e repassa a API

**Decisão:** o nginx que serve o front também repassa as requisições de `/api/*` para o container da API. O front é gerado com o endereço da API relativo (`/api`).

**Por quê:** o navegador acessa o front e a API no mesmo endereço. A mesma imagem funciona em qualquer IP ou domínio, sem precisar gerar o front de novo, e o CORS deixa de ser necessário.

Publicado pelo Tailscale Funnel (abaixo), o `/api` chega direto na API, e esse repasse do nginx fica sendo usado só quando o front é acessado sem o Funnel, como em http://localhost:5000.

### Publicação com o Tailscale Funnel

**Decisão:** a aplicação roda com o Docker Compose num servidor próprio, e é publicada na internet pelo [Tailscale Funnel](https://tailscale.com/kb/1223/funnel), num endereço só, com um caminho para cada serviço: o front em `/`, a documentação em `/docs` e a API em `/api`. As portas dos containers só respondem em `127.0.0.1`.

A aplicação está no ar em [evandro-home-server.tyrannosaurus-quillback.ts.net](https://evandro-home-server.tyrannosaurus-quillback.ts.net/):

| Serviço      | Endereço                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Front        | [https://evandro-home-server.tyrannosaurus-quillback.ts.net/](https://evandro-home-server.tyrannosaurus-quillback.ts.net/)                       |
| Documentação | [https://evandro-home-server.tyrannosaurus-quillback.ts.net/docs/](https://evandro-home-server.tyrannosaurus-quillback.ts.net/docs/)             |
| API          | [https://evandro-home-server.tyrannosaurus-quillback.ts.net/api/project](https://evandro-home-server.tyrannosaurus-quillback.ts.net/api/project) |

**Por quê:**

- **HTTPS sem configuração:** o Funnel gera e renova o certificado, e o servidor não precisa abrir nenhuma porta no roteador nem ter um IP público fixo.
- **Um endereço só:** o avaliador recebe uma URL, e a partir dela chega ao front, à documentação e à API. Como o front e a API ficam no mesmo endereço, o CORS continua desnecessário.
- **Nada exposto por fora:** com as portas presas ao `127.0.0.1`, o único caminho de fora até os containers é o Funnel. O banco também só aceita conexões do próprio servidor.

O front ficou na raiz, e não em `/web`, porque o Funnel não redireciona: com o front em `/web`, quem abrisse o endereço principal veria uma página vazia. Na raiz, o front também não precisa saber em que caminho está publicado. A documentação, que fica num subcaminho, é gerada com `base: "/docs/"`.

**Alternativas consideradas:**

- **Uma plataforma de hospedagem** (Render, Railway, Fly.io): dispensa o servidor, mas exigiria um banco gerenciado e um storage persistente para as capas, e cada serviço teria um endereço diferente.
- **Abrir as portas no roteador, com um proxy HTTPS** (Caddy, nginx): exige IP fixo ou DNS dinâmico, e deixa o servidor de casa exposto diretamente à internet.
- **Kubernetes:** não resolve nenhum problema desta aplicação, que tem um container por serviço, e acrescentaria complexidade sem ganho.

**Custo:** a disponibilidade depende do servidor de casa e da conexão dele. A configuração do Funnel fica no Tailscale do servidor, e não no repositório, então ela está descrita passo a passo no [guia de deploy](deploy.md#publicação-com-o-tailscale-funnel).

### Configuração por variáveis de ambiente

As credenciais do banco ficam num `.env` fora do repositório, e cada aplicação tem um `.env.example` com as variáveis que precisa. Em desenvolvimento, a API carrega o seu `.env` com o `godotenv`.

### Desenvolvimento

O `make dev` sobe o banco no Docker e roda a API (com recarga automática pelo [Air](https://github.com/air-verse/air)) e o front (com o Vite) ao mesmo tempo. O Air está registrado como ferramenta no `go.mod`, então quem clona o repositório não precisa instalá-lo à parte.

---

## Documentação

### Os mesmos Markdown, também como site

**Decisão:** a documentação é escrita em Markdown, na pasta `docs/` e no `README.md`, e também é publicada como um site com o [VitePress](https://vitepress.dev/). O `make docs` sobe o site em desenvolvimento, e o serviço `docs` do Docker Compose serve a versão estática, na porta 4000.

**Por quê:** os arquivos continuam legíveis direto no GitHub, que é onde um avaliador costuma começar, e o site acrescenta o que o Markdown solto não tem: menu lateral, sumário de cada página e busca. O VitePress é baseado no Vite, que o front já usa, e lê os arquivos como estão, sem exigir uma sintaxe própria.

Para os mesmos arquivos funcionarem nos dois lugares, a configuração do site:

- usa o `README.md` como página inicial, e as páginas de `docs/` na raiz do site (`/api`, `/deploy`);
- converte os links escritos para o GitHub (`../README.md`, `docs/api.md`) para as URLs do site;
- gera as âncoras dos títulos no formato do GitHub, mantendo os acentos (`#atualização-e-favoritos`), para os links internos, como o sumário deste documento, funcionarem igual nos dois.

O VitePress tem o seu próprio `package.json` dentro de `docs/`, separado do front. A imagem Docker usa a raiz do repositório como contexto, por causa do `README.md`, e o `docs/Dockerfile.dockerignore` limita o envio ao `README.md` e à pasta `docs/`.

**Alternativas consideradas:**

- **Docsify:** não tem build, e renderiza o Markdown no navegador. É o mais simples de configurar, mas o conteúdo só aparece depois de o JavaScript carregar, e a busca e a navegação são mais limitadas.
- **MkDocs com o tema Material:** muito completo, mas traria o Python como dependência a mais para um projeto feito em Go e Node.
- **Só os Markdown no GitHub:** funciona, mas sem busca nem navegação entre as páginas.

**Custo:** é um `package.json` e um container a mais para manter, e a conversão de links e âncoras é uma configuração própria, que precisa acompanhar novos padrões de link que surgirem nos documentos.

---

## Próximos passos

Melhorias que fazem sentido para a aplicação continuar evoluindo:

- **Migrations versionadas**, no lugar do `AutoMigrate`.
- **Storage externo** (S3 ou similar) para as capas, implementando a interface `Storage` que já existe.
- **Paginação** na listagem, aproveitando que os filtros já são feitos na API.
- **TanStack Query** no front, para cache, novas tentativas e cancelamento de requisições.
- **Autenticação**, para que cada pessoa tenha os seus projetos e o seu histórico de buscas.
- **Testes de integração** da API e testes de componentes no front.
