{{define "collectorDockerfile" -}}
FROM alpine:latest AS prep
RUN apk --update add ca-certificates

FROM scratch

ARG USER_UID=10001
ARG USER_GID=10001
USER ${USER_UID}:${USER_GID}

COPY --from=prep /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY {{.BuilderConfig.OutputPath}}/{{.BuilderConfig.Name}}/builder /

EXPOSE {{range .CollectorConfig.PortSlice}}{{.}} {{end}}

ENTRYPOINT ["/builder"]
CMD ["--config", "/etc/otel/config.yaml"]
{{ end }}