# Back-end (API)

[← Voltar ao README](../README.md) · [Rotas da API](api.md)

A API é escrita em Go e organizada em camadas, cada uma com uma responsabilidade.

## Estrutura de pastas

```
api/
├── cmd/
│   └── api/
│       └── main.go           Ponto de entrada: carrega a config e sobe o servidor HTTP
├── internal/
│   ├── config/               Leitura das variáveis de ambiente
│   ├── database/             Conexão com o Postgres e migração da tabela
│   ├── router/               Monta o router, o CORS e liga as camadas entre si
│   ├── handler/              Camada HTTP: lê a requisição e escreve a resposta
│   ├── service/              Regras de negócio
│   ├── repository/           Acesso ao banco com o GORM
│   ├── model/                Entidades, payloads e tipos (Project, Date, SortBy)
│   ├── storage/              Armazenamento das imagens de capa em disco
│   └── utils/                Logger, normalização de texto e extensões de arquivo
├── .air.toml                 Configuração da recarga automática em desenvolvimento
├── .env.example              Modelo das variáveis de ambiente
├── Dockerfile                Imagem de produção
└── go.mod                    Módulo e dependências
```

O código fica dentro de `internal/`, uma pasta especial do Go: nada fora do módulo consegue importar esses pacotes.

## Camadas e fluxo de uma requisição

```
requisição HTTP
  └─► router      escolhe o handler pela rota e aplica o CORS
      └─► handler     lê o ID, a query string e o corpo; escolhe o status da resposta
          └─► service     aplica as regras (validação, atualização parcial, capa)
              ├─► repository  monta e executa as queries no Postgres
              └─► storage     salva, lê e apaga os arquivos de capa
```

| Camada       | Responsabilidade                                                                        | Não sabe                              |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------- |
| `handler`    | Traduzir HTTP em chamadas ao service, e o resultado em JSON e status                    | Como os dados são guardados           |
| `service`    | Regras de negócio: validar, aplicar uma atualização parcial, coordenar banco e arquivos | Nada de HTTP                          |
| `repository` | Queries no banco: filtros, ordenação, inserção e atualização                            | Regras de negócio                     |
| `storage`    | Gravar, ler e apagar arquivos                                                           | Que os arquivos são capas de projetos |

Todas as dependências são criadas num único lugar, o `router`, em ordem: a conexão com o banco, o storage, o repository, o service e, por fim, o handler. Cada camada recebe as dependências prontas no construtor, em vez de criá-las por conta própria.

O `context` de cada requisição (`r.Context()`) é repassado do handler até o GORM. Se o cliente cancelar a requisição, a query no banco também é cancelada.

## Modelo de dados

A tabela é criada pelo `AutoMigrate` do GORM a partir da struct `ProjectModel`, quando a API inicia.

| Campo Go                   | Coluna                       | Tipo                                        |
| -------------------------- | ---------------------------- | ------------------------------------------- |
| `ID`                       | `id`                         | UUID, gerado pela aplicação                 |
| `CreatedAt`, `UpdatedAt`   | `created_at`, `updated_at`   | Data e hora, preenchidas pelo GORM          |
| `Name`                     | `name`                       | Texto                                       |
| `Client`                   | `client`                     | Texto                                       |
| `IsFavorite`               | `is_favorite`                | Booleano                                    |
| `InitialDate`, `FinalDate` | `initial_date`, `final_date` | Data, pelo tipo `model.Date`                |
| `CoverURL`                 | `cover_url`                  | Texto, opcional (o nome do arquivo da capa) |

O tipo **`model.Date`** existe porque o `time.Time` do Go só aceita datas com horário no JSON (`2026-11-30T00:00:00Z`). Datas de início e término de projeto são datas puras, sem horário. O `Date` aceita e devolve `YYYY-MM-DD` no JSON, e grava como data no banco, sem o risco de o fuso horário mudar o dia.

## Payloads e validação

| Payload           | Usado em                              | Detalhe                                                                               |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `ProjectPayload`  | `POST /project` e `PUT /project/{id}` | Campos ponteiro: `nil` significa "não enviado". É o que permite a atualização parcial |
| `FavoritePayload` | `PATCH /project/{id}/favorite`        | Um único campo, `is_favorite`                                                         |

As regras do projeto ficam no método `ProjectModel.Validate()`: nome e cliente preenchidos, as duas datas preenchidas, e a data de início não pode ser depois da de término. Na atualização, a validação roda **depois** de aplicar as alterações, para as regras que comparam dois campos usarem os valores já gravados.

Na criação, antes de montar o projeto, o `ProjectPayload.RequiredFieldsError()` verifica se todos os campos obrigatórios foram enviados, e a mensagem lista os que faltam.

## Tratamento de erros

As camadas devolvem erros com significado, e o handler é quem decide o status HTTP de cada um:

| Erro                            | Onde nasce                                               | Status |
| ------------------------------- | -------------------------------------------------------- | ------ |
| `*model.ValidationError`        | `Validate()` e `RequiredFieldsError()`                   | `400`  |
| `storage.ErrInvalidContentType` | `LocalStorage.Save`, quando o arquivo não é JPEG nem PNG | `400`  |
| `*http.MaxBytesError`           | Leitura do upload acima de 5 MB                          | `413`  |
| `model.ErrNotFound`             | Repository, quando o projeto não existe                  | `404`  |
| `model.ErrNoCover`              | Service, quando o projeto não tem capa                   | `404`  |
| Qualquer outro                  | Falhas inesperadas, como uma queda do banco              | `500`  |

A tradução fica numa única função, `errorStatus` (em `handler/errors.go`), usada por todos os handlers. Nos erros 500, a resposta traz só `internal server error`, e o erro original vai para o log, para não expor detalhes internos (como mensagens do banco) para quem chama a API.

O middleware `Recoverer` do chi fica como rede de segurança: um panic inesperado vira uma resposta 500, em vez de derrubar a conexão.

## Busca, filtro e ordenação

A listagem monta a query dinamicamente no `ProjectRepository.FindAll`:

1. **Busca:** o `service` separa o termo em palavras e normaliza cada uma (remove acentos e converte para minúsculas, com `utils.WordToTerms`). Para cada palavra, o repository acrescenta a condição:

   ```sql
   (unaccent(lower(name)) LIKE '%palavra%' OR unaccent(lower(client)) LIKE '%palavra%')
   ```

   As condições das palavras são unidas com `AND`. Cada palavra precisa aparecer no nome **ou** no cliente, em qualquer ordem. Assim, "etanol acme" encontra o projeto "Etanol Cachaça", do cliente "Acme".

   A normalização é aplicada aos **dois lados** da comparação: ao termo, pelo Go, e às colunas, pelo Postgres, com `lower` e `unaccent`. A extensão `unaccent` é ativada pela API ao conectar no banco.

2. **Favoritos:** `is_favorite = true`, quando o filtro está ligado.

3. **Ordenação:** um `switch` sobre o `SortBy` escolhe o `ORDER BY`. O valor que vem da requisição nunca entra direto no SQL: ele é convertido para uma das constantes conhecidas, e um valor desconhecido vira a ordenação por nome.

## Armazenamento das capas

As capas ficam em disco, numa pasta definida por `UPLOADS_BASE_PATH`. O `storage.LocalStorage` cuida disso:

- **Validação pelo conteúdo:** o `Save` lê os primeiros 512 bytes e usa o `http.DetectContentType` para descobrir o tipo real do arquivo. Só JPEG e PNG são aceitos.
- **Gravação em streaming:** depois de ler o início do arquivo, o `Save` grava esses bytes e o restante com um `io.MultiReader`. O arquivo é copiado em pedaços, sem carregar a imagem inteira na memória.
- **Nome gerado pela API:** o arquivo é salvo com o ID do projeto e a extensão do tipo detectado (`.jpg` ou `.png`). O nome enviado pelo cliente nunca é usado, o que evita que um nome como `../../arquivo` grave fora da pasta.
- **Remoção junto com o projeto:** ao remover um projeto, o service também apaga o arquivo da capa.

O limite de 5 MB é aplicado no handler, com o `http.MaxBytesReader`, antes de o arquivo chegar ao storage.

## Configuração

As variáveis são lidas em `internal/config`. Se existir um arquivo `.env` na pasta da API, ele é carregado com o `godotenv`. Sem o arquivo, a API usa as variáveis do ambiente, que é o caso dentro do Docker. A descrição de cada variável está no [README](../README.md#variáveis-de-ambiente).

## Testes

Os testes ficam ao lado de cada arquivo (`*_test.go`) e usam só a biblioteca padrão do Go, em formato de tabela.

| Pacote    | O que é testado                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `utils`   | `NormalizeWord`, `WordToTerms` e `DetectFileExtension`                                                    |
| `model`   | O tipo `Date` (JSON, `Value` e `Scan`), o `Validate`, o `SortBy` e o `NewBaseModel`                       |
| `storage` | Salvar, ler e apagar capas numa pasta temporária, incluindo a garantia de que o arquivo é gravado inteiro |

```sh
cd api && go test ./...
```

## Dependências

| Pacote                                                         | Para quê                                                                                                                |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`github.com/go-chi/chi`](https://github.com/go-chi/chi)       | Roteador HTTP. Compatível com o `net/http` da biblioteca padrão: os handlers são `http.HandlerFunc` comuns              |
| [`github.com/go-chi/cors`](https://github.com/go-chi/cors)     | Middleware de CORS                                                                                                      |
| [`gorm.io/gorm`](https://gorm.io) e `gorm.io/driver/postgres`  | ORM: monta as queries, faz o mapeamento das structs e cria a tabela com o `AutoMigrate`. O driver usa o `pgx` por baixo |
| [`github.com/google/uuid`](https://github.com/google/uuid)     | Geração e validação dos IDs                                                                                             |
| [`github.com/joho/godotenv`](https://github.com/joho/godotenv) | Carrega o arquivo `.env` em desenvolvimento                                                                             |
| [`golang.org/x/text`](https://pkg.go.dev/golang.org/x/text)    | Remoção de acentos na normalização da busca                                                                             |
| [`github.com/air-verse/air`](https://github.com/air-verse/air) | Recarga automática da API em desenvolvimento. Registrado como ferramenta no `go.mod` e executado com `go tool air`      |
