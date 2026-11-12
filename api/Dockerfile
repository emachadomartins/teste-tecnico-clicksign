# Estágio 1: compila o binário
FROM golang:1.27-alpine AS build

WORKDIR /src

# Baixa as dependências primeiro, para o Docker reaproveitar esta camada
# enquanto o go.mod e o go.sum não mudarem
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

# Estágio 2: imagem final, só com o binário
FROM alpine:3.22

RUN adduser -D -u 10001 app \
    && mkdir -p /app/uploads \
    && chown -R app:app /app

WORKDIR /app
COPY --from=build /out/api /app/api

USER app

ENV PORT=3000
ENV UPLOADS_BASE_PATH=/app/uploads

EXPOSE 3000

CMD ["/app/api"]
