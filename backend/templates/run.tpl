{{define "run" -}}
# Step 1: Install the OpenTelemetry collector builder
go install go.opentelemetry.io/collector/cmd/builder@latest

# Step 2: Generate the otelcol-builder.yaml file
mkdir -p {{.BuilderConfig.OutputPath}}/{{.BuilderConfig.Name}}
cat > otelcol-builder.yaml <<EOF
{{template "builder" .}}
EOF

# Step 3: Run the builder with the configuration
export PATH="$HOME/go/bin:$PATH" #Overwrite the GO path if needed

case "$(uname -s)" in
  Darwin) LDFLAGS="" ;;
  Linux)  LDFLAGS="-linkmode external -extldflags '-static'" ;;
  *)      echo "Unsupported OS"; exit 1 ;;
esac

builder --config=otelcol-builder.yaml --ldflags="$LDFLAGS" --verbose

cat > otelcol.yaml <<EOF
{{.CollectorConfig.Manifest}}
EOF

{{if eq .BuilderConfig.RunConfig "binary"}}
{{template "runConfigBinary" .}}
{{else if eq .BuilderConfig.RunConfig "docker"}}
{{template "runConfigDocker" .}}
{{ end }}
{{- end }}      