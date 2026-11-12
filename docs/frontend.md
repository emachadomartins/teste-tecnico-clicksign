# Front-end

[← Voltar ao README](../README.md) · [Rotas da API](api.md)

O front é uma aplicação React de página única (SPA), escrita em TypeScript e construída com o Vite.

## Estrutura de pastas

```
web/
├── public/                  Arquivos servidos como estão (favicon)
├── src/
│   ├── main.tsx             Ponto de entrada: fontes, CSS global e o router
│   ├── router.tsx           Definição das rotas
│   ├── App.tsx              Layout comum: a top-bar e a área das páginas
│   ├── index.css            Variáveis de cor, estilos globais e reset
│   ├── theme.ts             As cores para uso nos componentes TSX
│   ├── api/                 Comunicação com a API
│   ├── pages/               Uma pasta por página (rota)
│   ├── components/          Componentes reutilizáveis
│   ├── hooks/               Hooks próprios
│   ├── utils/               Funções puras (busca, datas, validação)
│   ├── types/               Tipos compartilhados
│   └── assets/              Imagens e ícones
├── nginx.conf               Configuração do nginx na imagem Docker
├── Dockerfile               Imagem de produção
└── vite.config.ts           Configuração do Vite
```

Cada componente e cada página tem a sua própria pasta, com um `index.tsx` e um `styles.css`. Os testes ficam ao lado dos arquivos testados (`*.test.ts`).

## Cores

As cores são definidas uma única vez, como variáveis CSS no `:root` do `index.css`, com nomes que descrevem o papel de cada uma (`--color-primary`, `--color-danger`, `--color-text-muted`...). Os arquivos CSS usam sempre as variáveis, e nunca o valor da cor.

Nos componentes TSX, as cores vêm do `theme.ts`, que aponta para as mesmas variáveis:

```tsx
<Icon icon="trash" color="primary" size={20} />
```

As props de cor do `Icon` (`color`, `fill` e `circleColor`) só aceitam os nomes do `theme.ts`, então o TypeScript recusa um valor hex escrito direto no componente. Para mudar uma cor do app inteiro, basta alterar a variável no `index.css`.

## Rotas

| Rota | Página |
|---|---|
| `/` | `ProjectList`: a listagem |
| `/projects/new` | `ProjectForm`: criação de projeto |
| `/projects/:id/edit` | `ProjectForm`: edição de projeto |

Todas as rotas são filhas do `App`, que renderiza a `Topbar` e um `<Outlet />` do React Router, onde a página da rota atual aparece. A top-bar fica igual em todas as páginas, e só o conteúdo muda.

## Estado na URL

A busca, o filtro de favoritos e a ordenação ficam na query string da URL, e não em estados do React:

```
/?term=etanol&favorites_only=true&sort_by=final_date
```

Essa escolha resolve três coisas:

- **A comunicação entre a top-bar e a listagem.** A busca fica na `Topbar` e a lista fica na `ProjectList`, que são componentes separados. A top-bar escreve o termo na URL com o `useSearchParams`, e a lista lê da URL, sem que um precise conhecer o outro.
- **Os filtros sobrevivem a um recarregamento** da página e ao botão "voltar" do navegador.
- **A lista filtrada pode ser compartilhada** por link.

Sempre que um desses parâmetros muda, a `ProjectList` busca os projetos de novo na API, que faz a filtragem.

## Páginas

### `ProjectList` (`pages/ProjectList`)

A listagem de projetos, na rota `/`.

- **Cabeçalho:** o título "Projetos" com o total, o switch "Apenas favoritos", o seletor de ordenação e o botão "Novo Projeto".
- **Grid de cards:** um `ProjectCard` para cada projeto.
- **Estado vazio:** quando não há nenhum projeto cadastrado (e nenhum filtro ligado), mostra o `ProjectEmpty` no lugar da listagem. Com um filtro ligado e nenhum resultado, o cabeçalho continua visível, para o filtro poder ser desligado.
- **Remoção:** guarda qual projeto está sendo removido e abre o `ConfirmDialog`. O projeto só sai da lista depois de a API confirmar a remoção.
- **Favoritar:** a estrela muda na hora, e a alteração é enviada à API em seguida.

O seletor de ordenação é um componente feito à mão, e não um `<select>` nativo. O `<select>` não permite estilizar as opções de forma consistente entre navegadores, nem saber quando a lista está aberta para girar a seta.

### `ProjectForm` (`pages/ProjectForm`)

O formulário de criação e de edição. A mesma página atende às duas rotas: se a URL tem um `id`, ela carrega o projeto da API e entra no modo de edição.

- **Campos:** nome, cliente, datas de início e de término, e a capa.
- **Validação:** feita a cada alteração, a partir do estado do formulário (com a função `validate`, em `utils/projectForm.ts`). O erro de cada campo só aparece depois que o campo foi visitado, para o formulário não abrir com tudo em vermelho. O botão de envio fica desabilitado enquanto há erros.
- **Datas:** os campos de data usam `min` e `max` para limitar o calendário: o início não pode ser no passado (só na criação) e o término não pode ser antes do início.
- **Capa:** a área de upload mostra uma prévia da imagem escolhida, com o `URL.createObjectURL`, e, na edição, a capa atual. O botão de lixeira descarta a imagem escolhida ou marca a capa atual para remoção.
- **Envio:** primeiro o projeto é criado ou atualizado, com JSON. Depois, se houver uma imagem nova, ela é enviada numa segunda requisição. Se o projeto for salvo mas a capa falhar, a pessoa continua no formulário com uma mensagem, e, na criação, a URL muda para a edição do projeto recém-criado. Assim, tentar de novo atualiza o projeto, em vez de criar um segundo.

| Regra de validação | Campo |
|---|---|
| Ao menos duas palavras | Nome |
| Ao menos 5 caracteres | Cliente |
| Obrigatória, e não pode estar no passado (só na criação) | Data de início |
| Obrigatória, e não pode ser antes da data de início | Data de término |
| JPG ou PNG, até 5 MB | Capa |

## Componentes

| Componente | O que faz | Por que existe |
|---|---|---|
| `Topbar` | Logo, botão de busca e a barra de busca, que abre por cima da top-bar, com o histórico das últimas buscas logo abaixo. A busca é disparada com Enter, e um X na top-bar limpa a busca ativa | A busca precisa estar disponível acima da listagem, e o histórico aparece como sugestão sem alterar o layout da página. O botão de busca só aparece na listagem |
| `ProjectCard` | O card de um projeto: capa (ou um ícone, quando não há capa), estrela de favorito, menu com "Editar" e "Remover", nome, cliente e as datas por extenso. O termo buscado aparece destacado no nome e no cliente | A unidade visual da listagem. Ele não chama a API: avisa a página pelas props `onFavorite` e `onDelete`, e a página decide o que fazer |
| `ProjectEmpty` | A tela para quando não há nenhum projeto, com o botão de criar o primeiro | O estado vazio da listagem, pedido no design |
| `ConfirmDialog` | Modal de confirmação, com título, mensagem, ícone opcional e os botões "Cancelar" e "Confirmar" | A remoção de um projeto é definitiva, então pede confirmação. Usa o elemento nativo `<dialog>`, que já cuida do fundo escurecido, de prender o foco no modal e de fechar com Esc |
| `FormInput` | Um campo de formulário com label, a marca "(Obrigatório)" e a mensagem de erro. Também aceita outro conteúdo no lugar do input, como a área de upload | Padroniza a aparência e o comportamento de erro de todos os campos do formulário. Repassa ao `<input>` qualquer atributo nativo (`value`, `onChange`, `min`...) |
| `Button` | Botão nas variantes `primary` (roxo) e `secondary` (branco), com ícone opcional. Com `isLink`, vira um link do React Router com a mesma aparência. Com `isFake`, vira um `<span>` com aparência de botão | Os botões e links com cara de botão ficam iguais em todo o app. Elementos que navegam continuam sendo links de verdade (abrem em nova aba, por exemplo). O `isFake` existe para o "Selecionar" da área de upload, que fica dentro de uma `<label>` e não pode ser um botão real |
| `Icon` | Renderiza um ícone pelo nome (`<Icon icon="trash" />`), com opção de círculo de fundo, sombra e de ser clicável | Um ponto único para os ícones do app: só os ícones usados entram no bundle, e o nome é verificado pelo TypeScript. Quando clicável, exige um `label`, porque um botão só com ícone precisa de um texto para leitores de tela |

## Hooks

| Hook | O que faz |
|---|---|
| `useSearchHistory` | Guarda as últimas 5 buscas no `localStorage` do navegador. Ignora buscas com menos de 3 caracteres, não repete termos (sem diferenciar maiúsculas) e coloca a mais recente no topo |

O histórico fica no `localStorage` porque a aplicação não tem login: o histórico é naturalmente por navegador.

## Comunicação com a API (`src/api`)

| Arquivo | O que faz |
|---|---|
| `client.ts` | A função `request`, que é o único lugar que chama o `fetch`. Junta a URL base (`VITE_API_URL`), define o `Content-Type` JSON (exceto em uploads com `FormData`), lê o envelope `{ data, metadata, error }` e lança um `ApiError` com o status e a mensagem quando a resposta é um erro |
| `project.ts` | O `projectsApi`, com uma função por rota (`list`, `get`, `create`, `update`, `delete`, `setFavorite`, `uploadCover`), e o `toProject`, que converte o projeto da API (snake_case) para o formato usado no front (camelCase) |

Os componentes nunca chamam o `fetch` direto. Isso deixa a URL da API, os headers e o tratamento de erro num lugar só.

O `toProject` também monta a URL da capa a partir da rota `GET /project/{id}/cover`, com o nome do arquivo como versão (`?v=...`). Quando a capa muda, a URL muda, e o navegador baixa a imagem nova em vez de usar a antiga do cache.

## Funções utilitárias (`src/utils`)

| Função | Arquivo | O que faz |
|---|---|---|
| `highlightTerm` | `string.ts` | Divide um texto em partes destacadas e não destacadas, a partir do termo buscado. Cada palavra é destacada separadamente, ignorando maiúsculas e acentos, mas o texto exibido mantém os acentos originais |
| `formatLongDate` | `date.ts` | Formata uma data `YYYY-MM-DD` por extenso ("11 de novembro de 2026"). Usa o fuso UTC para a data não voltar um dia no Brasil |
| `toDateInputValue` | `date.ts` | A data de hoje, no horário local, no formato do `<input type="date">` |
| `validate` | `projectForm.ts` | As regras de validação do formulário de projeto |

## Testes

Os testes usam o [Vitest](https://vitest.dev/), rodam no Node, sem navegador, e cobrem as funções de `utils/` e a conversão do `toProject`.

```sh
cd web && npm test
```

## Dependências

| Pacote | Para quê |
|---|---|
| [`react`](https://react.dev) e `react-dom` | Biblioteca de interface |
| [`react-router`](https://reactrouter.com) | Rotas, navegação, parâmetros da URL (`useParams`) e query string (`useSearchParams`) |
| [`lucide-react`](https://lucide.dev) | Biblioteca de ícones, usada pelo componente `Icon` |
| [`@fontsource/encode-sans-semi-expanded`](https://fontsource.org) | A fonte do design, servida junto com o app, sem depender do Google Fonts |
| [`vite`](https://vite.dev) e `@vitejs/plugin-react` | Servidor de desenvolvimento e build de produção |
| [`typescript`](https://www.typescriptlang.org) | Tipagem estática |
| [`vitest`](https://vitest.dev) | Testes |
| [`oxlint`](https://oxc.rs) | Lint |
