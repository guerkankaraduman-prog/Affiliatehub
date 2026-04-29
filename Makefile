SHELL := /bin/sh

.PHONY: setup dev dev-backend dev-frontend build build-backend build-frontend test test-backend test-frontend lint lint-backend lint-frontend migrate seed docker-up docker-down format

setup:
	pnpm --dir frontend install
	cargo fetch --manifest-path backend/Cargo.toml

dev:
	docker compose up --build

dev-backend:
	cargo run --manifest-path backend/Cargo.toml

dev-frontend:
	pnpm --dir frontend dev

build: build-backend build-frontend

build-backend:
	cargo build --release --manifest-path backend/Cargo.toml

build-frontend:
	pnpm --dir frontend build

test: test-backend test-frontend

test-backend:
	cargo test --manifest-path backend/Cargo.toml --all-features --all-targets

test-frontend:
	pnpm --dir frontend test -- --passWithNoTests

lint: lint-backend lint-frontend

lint-backend:
	cargo fmt --manifest-path backend/Cargo.toml --all -- --check
	cargo clippy --manifest-path backend/Cargo.toml --all-targets --all-features -- -D warnings

lint-frontend:
	pnpm --dir frontend lint
	pnpm --dir frontend exec tsc --noEmit

format:
	cargo fmt --manifest-path backend/Cargo.toml --all
	pnpm --dir frontend exec prettier . --write

migrate:
	sqlx migrate run --source backend/migrations

seed:
	cargo run --manifest-path backend/Cargo.toml --bin seed

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down --remove-orphans
