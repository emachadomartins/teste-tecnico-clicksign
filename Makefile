.PHONY: dev db api web stop

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
