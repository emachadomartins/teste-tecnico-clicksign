# Estágio 1: gera o build estático
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# O Vite embute as variáveis VITE_* no bundle durante o build,
# então a URL da API precisa ser informada aqui, e não ao rodar o container
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Estágio 2: serve os arquivos com o nginx
FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
