FROM golang:1.23-alpine AS build

WORKDIR /app

RUN apk add --no-cache gcc musl-dev libc-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=1

RUN go build -o /app/bin/otelcol-cookbook-backend ./main.go

FROM alpine:latest AS run

RUN apk add --no-cache ca-certificates

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# DB file is stored in /app/data
RUN mkdir data

COPY --from=build /app/bin/otelcol-cookbook-backend /app/
COPY --from=build /app/config /app/config
COPY --from=build /app/templates /app/templates

EXPOSE 8888

CMD ["/app/otelcol-cookbook-backend"]
