# ✅ Checklist — Teste Técnico Clicksign

Gerenciador de projetos: visualizar, adicionar, editar, remover e favoritar projetos.

> Design de referência: Figma

---

## 🏗️ Setup

- [x] Inicializar repositório Git
- [x] Criar estrutura de pastas do projeto do backend (Go)
- [x] Criar estrutura de pstas do projeto do frontend (React)
- [x] Configurar banco de dados
- [x] Configurar lint/formatter
- [x] Configurar variáveis de ambiente (`.env.example`)

## 🔌 API

- [x] `[GET] /projects` — listar projetos
- [x] `[GET] /projects/:id` — detalhar projeto
- [x] `[POST] /projects` — criar projeto
- [x] `[PUT|PATCH] /projects/:id` — editar projeto
- [x] `[DELETE] /projects/:id` — remover projeto
- [x] `[PATCH] /projects/:id/favorite` — favoritar/desfavoritar
- [x] Suporte a busca, filtro de favoritos e ordenação (query params)
- [x] Validação dos dados de entrada
- [x] Tratamento de erros padronizado

## 📋 Listagem

- [x] Estado vazio (nenhum projeto cadastrado), conforme o design
- [x] Exibir título da página
- [x] Exibir total de projetos cadastrados
- [x] Filtro para exibir apenas favoritos
- [x] Ordenação:
  - [x] Ordem alfabética (padrão)
  - [x] Projetos iniciados mais recentemente
  - [x] Projetos próximos à data de finalização

## 📝 Formulários

- [x] Página de criação de projeto
- [x] Página de edição de projeto
- [x] Validação dos campos no front-end
- [x] Corrigir as mensagens de erro do formulário (o cliente exige 5 caracteres, mas a mensagem diz "ao menos uma palavra"; o nome diz "duas palavra")

## 🗑️ Remoção

- [x] Modal de confirmação de remoção

## ⭐ Favoritos

- [x] Favoritar/desfavoritar projetos

## 🔍 Busca

- [x] Barra de busca
- [x] Disparar busca somente com no mínimo 3 caracteres
- [x] Histórico das últimas 5 buscas
- [x] Highlight do termo buscado nos resultados

## 🎨 Fidelidade ao design

- [x] Cores, tipografia e espaçamentos conforme o Figma
- [x] Ícones e assets exportados do Figma
- [x] Responsividade (se prevista no design)
- [x] Estados de loading e erro

## 🧪 Qualidade

- [x] Testes da API
- [x] Testes do front-end
- [x] Código organizado e legível

## 📚 Documentação

- [x] README com instruções para rodar o projeto localmente
- [x] Documento de decisões técnicas (stack, arquitetura, trade-offs)
- [x] Documentação dos endpoints da API
- [x] Site da documentação (VitePress) — [evandro-home-server.tyrannosaurus-quillback.ts.net/docs](https://evandro-home-server.tyrannosaurus-quillback.ts.net/docs/)

## 🚀 Entrega

- [x] Deploy do front-end — [evandro-home-server.tyrannosaurus-quillback.ts.net](https://evandro-home-server.tyrannosaurus-quillback.ts.net/)
- [x] Deploy da API — [evandro-home-server.tyrannosaurus-quillback.ts.net/api](https://evandro-home-server.tyrannosaurus-quillback.ts.net/api/project)
- [x] Enviar link do repositório
- [x] Enviar URL do projeto funcional
- [x] Enviar link da documentação de decisões técnicas
