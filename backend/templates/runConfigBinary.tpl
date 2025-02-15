{{define "runConfigBinary" -}}
# Step 4: Run the collector
{{.BuilderConfig.OutputPath}}/{{.BuilderConfig.Name}}/builder --config otelcol.yaml
{{end}}
