{{define "builder" -}}
dist:
  name: "{{.BuilderConfig.Name}}"
  description: "{{.BuilderConfig.Description}}"
  output_path: "{{.BuilderConfig.OutputPath}}"
  {{if .BuilderConfig.Version}}version: "{{.BuilderConfig.Version}}"{{end}}

{{- if .Extensions }}
extensions:
  {{- range .Extensions}}
    - gomod: "{{.ModuleUrl}} {{.Version}}"
  {{- end }}
{{ end }}

{{- if .Receivers }}
receivers:
  {{- range .Receivers}}
    - gomod: "{{.ModuleUrl}} {{.Version}}"
  {{- end }}
{{end }}

{{- if .Processors }}
processors:
  {{- range .Processors}}
    - gomod: "{{.ModuleUrl}} {{.Version}}"
  {{- end }}
{{end }}

{{- if .Exporters }}
exporters:
  {{- range .Exporters}}
    - gomod: "{{.ModuleUrl}} {{.Version}}"
  {{- end }}
{{end }}

{{- if .Providers }}
providers:
  {{- range .Providers}}
    - gomod: "{{.ModuleUrl}} {{.Version}}"
  {{- end }}
{{- end }}
{{- end}}  