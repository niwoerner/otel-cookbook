build: 
	@go build -o bin/app

run: build
	@export CGO_ENABLED=1
	@export ENV_NAME=dev
	@air

test: 
	@go test -v ./internal

lint:
	golangci-lint run