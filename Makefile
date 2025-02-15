.PHONY: run lint build test precommit

run:
	(cd frontend && npm run dev) &
	$(MAKE) -C backend run

lint:
	(cd frontend && npm run lint)
	$(MAKE) -C backend lint

build:
	(cd frontend && npm run build)
	$(MAKE) -C backend build

test:
	# (cd frontend && npm run test)
	$(MAKE) -C backend test

check:
	$(MAKE) test
	$(MAKE) lint
	$(MAKE) build