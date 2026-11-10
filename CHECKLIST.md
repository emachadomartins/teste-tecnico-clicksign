# ✅ Checklist — Teste Técnico Clicksign

Gerenciador de projetos: visualizar, adicionar, editar, remover e favoritar projetos.

> Design de referência: Figma

---

## 🏗️ Setup

- [x] Inicializar repositório Git
- [ ] Criar estrutura de pastas do projeto do backend (Go)
- [ ] Criar estrutura de pstas do projeto do frontend (React)
- [ ] Configurar banco de dados
- [ ] Configurar lint/formatter
- [ ] Configurar variáveis de ambiente (`.env.example`)

## 🔌 API

- [ ] `[GET] /projects` — listar projetos
- [ ] `[GET] /projects/:id` — detalhar projeto
- [ ] `[POST] /projects` — criar projeto
- [ ] `[PUT|PATCH] /projects/:id` — editar projeto
- [ ] `[DELETE] /projects/:id` — remover projeto
- [ ] `[PATCH] /projects/:id/favorite` — favoritar/desfavoritar
- [ ] Suporte a busca, filtro de favoritos e ordenação (query params)
- [ ] Validação dos dados de entrada
- [ ] Tratamento de erros padronizado

## 📋 Listagem

- [ ] Estado vazio (nenhum projeto cadastrado), conforme o design
- [ ] Exibir título da página
- [ ] Exibir total de projetos cadastrados
- [ ] Filtro para exibir apenas favoritos
- [ ] Ordenação:
  - [ ] Ordem alfabética (padrão)
  - [ ] Projetos iniciados mais recentemente
  - [ ] Projetos próximos à data de finalização

## 📝 Formulários

- [ ] Página de criação de projeto
- [ ] Página de edição de projeto
- [ ] Validação dos campos no front-end

## 🗑️ Remoção

- [ ] Modal de confirmação de remoção

## ⭐ Favoritos

- [ ] Favoritar/desfavoritar projetos

## 🔍 Busca

- [ ] Barra de busca
- [ ] Disparar busca somente com no mínimo 3 caracteres
- [ ] Histórico das últimas 5 buscas
- [ ] Highlight do termo buscado nos resultados

## 🎨 Fidelidade ao design

- [ ] Cores, tipografia e espaçamentos conforme o Figma
- [ ] Ícones e assets exportados do Figma
- [ ] Responsividade (se prevista no design)
- [ ] Estados de loading e erro

## 🧪 Qualidade

- [ ] Testes da API
- [ ] Testes do front-end
- [ ] Código organizado e legível

## 📚 Documentação

- [ ] README com instruções para rodar o projeto localmente
- [ ] Documento de decisões técnicas (stack, arquitetura, trade-offs)
- [ ] Documentação dos endpoints da API

## 🚀 Entrega

- [ ] Deploy do front-end
- [ ] Deploy da API
- [ ] Enviar link do repositório
- [ ] Enviar URL do projeto funcional
- [ ] Enviar link da documentação de decisões técnicas
