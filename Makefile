.DEFAULT_GOAL := help
PY ?= python

.PHONY: help install install-pose lint format typecheck test test-fast check web-install web-dev web-build clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install the package with dev tooling (editable)
	$(PY) -m pip install -e ".[dev]"

install-pose: ## Also install MediaPipe + OpenCV for pose extraction / video inference
	$(PY) -m pip install -e ".[dev,pose]"

lint: ## Ruff lint + format check
	ruff check .
	ruff format --check .

format: ## Auto-format and fix lint issues
	ruff check --fix .
	ruff format .

typecheck: ## Static type checks
	mypy

test: ## Full test suite (includes a tiny training run)
	pytest

test-fast: ## Skip slow tests
	pytest -m "not slow"

check: lint typecheck test ## Everything CI runs

web-install: ## Install website dependencies
	cd web && npm ci

web-dev: ## Run the website locally
	cd web && npm run dev

web-build: ## Production build of the website
	cd web && npm run lint && npm run build

clean: ## Remove caches and build artefacts
	rm -rf build dist *.egg-info .pytest_cache .mypy_cache .ruff_cache .coverage htmlcov
	find . -name __pycache__ -type d -prune -exec rm -rf {} +
