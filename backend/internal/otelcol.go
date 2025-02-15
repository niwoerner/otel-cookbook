package server

type OtelCollector struct {
	BuilderConfig   BuilderConfig
	CollectorConfig CollectorConfig
	Extensions      []OtelComponent `json:"Extensions"`
	Receivers       []OtelComponent `json:"Receivers"`
	Processors      []OtelComponent `json:"Processors"`
	Exporters       []OtelComponent `json:"Exporters"`
	Providers       []OtelComponent `json:"Providers"`
}

type CollectorConfig struct {
	Ports           string `json:"Ports"` // comma-separated string
	PortSlice       []string
	DockerImageName string `json:"DockerImageName"`
	Manifest        string `json:"Manifest"`
}
