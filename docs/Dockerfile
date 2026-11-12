# O contexto do build é a raiz do repositório, porque o site usa o README.md
# como página inicial. O docs/Dockerfile.dockerignore limita o que é enviado.

# Estágio 1: gera o site estático
FROM node:24-alpine AS build

WORKDIR /app

COPY docs/package.json docs/package-lock.json docs/
RUN cd docs && npm ci

COPY README.md ./
COPY docs/ docs/

# O caminho em que o site é publicado
ARG DOCS_BASE=/docs/
ENV DOCS_BASE=$DOCS_BASE
RUN cd docs && npm run build

# Estágio 2: serve os arquivos com o nginx
FROM nginx:1.29-alpine

COPY docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80
