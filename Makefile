.PHONY: up down logs ps db-reset

up:
	docker compose up -d --wait db

down:
	docker compose down

logs:
	docker compose logs -f db

ps:
	docker compose ps

db-reset:
	docker compose down -v
	docker compose up -d --wait db
	pnpm db:migrate
	pnpm db:seed
	pnpm db:check
