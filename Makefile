.PHONY: dev db api web stop test lint format

## Sobe o banco e roda API + front em modo de desenvolvimento
dev: db
	$(MAKE) -j2 api web

## Sobe o Postgres em segundo plano e espera ele ficar pronto
db:
	docker compose up -d --wait db

## API com hot reload (Air)
api:
	cd api && go tool air

## Front com Vite
web:
	cd web && npm run dev

## Para o banco (os dados continuam no volume)
stop:
	docker compose stop

test: test-api test-web

## Testes da API
test-api:
	cd api && go test ./...

## Testes do front
test-web:
	cd web && npm test

lint:
	cd api && test -z "$$(gofmt -l .)" && go vet ./...
	cd web && npm run lint && npm run format:check

format:
	cd api && gofmt -w .
	cd web && npm run format
