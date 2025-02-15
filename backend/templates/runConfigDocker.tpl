{{define "runConfigDocker" -}}
# Step 4: Build a Docker image and run your collector

cat > Dockerfile <<EOF
{{template "collectorDockerfile" .}}
EOF

docker build -t {{.CollectorConfig.DockerImageName}} .

# Starting the Otel collector in a docker container
docker run --rm \
    -v "$(pwd)/otelcol.yaml:/etc/otel/config.yaml:ro" \
    {{range .CollectorConfig.PortSlice}}-p {{.}}:{{.}} \
    {{end}} {{.CollectorConfig.DockerImageName}}

{{end -}}
