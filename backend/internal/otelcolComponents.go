package server

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"gopkg.in/yaml.v2"
)

var (
	githubManifestUrl = "https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-releases/main/distributions/otelcol-contrib/manifest.yaml"
)

const (
	cacheKey      = "otel_manifest"
	cacheDuration = 5 * time.Minute
)

// OtelContrib manifest yaml file struct retrieved from Github
type OtelContribDist struct {
	Dist struct {
		Module      string `yaml:"module"`
		Name        string `yaml:"name"`
		Description string `yaml:"description"`
		Version     string `yaml:"version"`
		OutputPath  string `yaml:"output_path"`
	} `yaml:"dist"`
	Extensions []OtelContribDistComponent `yaml:"extensions"`
	Exporters  []OtelContribDistComponent `yaml:"exporters"`
	Processors []OtelContribDistComponent `yaml:"processors"`
	Receivers  []OtelContribDistComponent `yaml:"receivers"`
	Connectors []OtelContribDistComponent `yaml:"connectors"`
	Providers  []OtelContribDistComponent `yaml:"providers"`
}

type OtelContribDistComponent struct {
	Gomod string `yaml:"gomod"`
}

// Response struct
type OtelCollectorComponents struct {
	Receivers  []OtelComponent
	Exporters  []OtelComponent
	Processors []OtelComponent
	Connectors []OtelComponent
	Providers  []OtelComponent
	Extensions []OtelComponent
}

type OtelComponent struct {
	Type      string `json:"type"`
	Name      string `json:"name"`
	ModuleUrl string `json:"moduleUrl"`
	GithubUrl string `json:"githubUrl"`
	Version   string `json:"version"`
}

const (
	getOtelComponentErrMsg = "Error while getting the otel collector components"
)

func (s *Server) getOtelComponentsHandler(w http.ResponseWriter, r *http.Request) {
	var manifest OtelContribDist
	occ := OtelCollectorComponents{}

	//cache hit
	foo, found := s.cache.Get("foo")
	if found {
		manifest = foo.(OtelContribDist)
	} else {
		//cache miss
		resp, err := http.Get(githubManifestUrl)
		if err != nil {
			s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
			s.logger.Sugar().Errorf("%s: Error retrieving otel collector components from github", getOtelComponentErrMsg)
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
			s.logger.Sugar().Errorf("%s: Error reading retrieved otel collector components", getOtelComponentErrMsg)
			return
		}

		err = yaml.Unmarshal(body, &manifest)
		if err != nil {
			s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
			s.logger.Sugar().Errorf("%s: Error unmarshalling retrieved otel collector components", getOtelComponentErrMsg)
			return
		}

		//cache store
		s.cache.Set("foo", manifest, cacheDuration)
	}

	occ.processManifestComponents(manifest)

	s.JSONResponse(w, r, occ)

	s.logger.Info("Successfully returned the otel collector components")
}

func (occ *OtelCollectorComponents) processManifestComponents(manifest OtelContribDist) {
	for _, c := range manifest.Receivers {
		occ.Receivers = append(occ.Receivers, occ.processComponent(c.Gomod, "Receiver"))
	}

	for _, c := range manifest.Exporters {
		occ.Exporters = append(occ.Exporters, occ.processComponent(c.Gomod, "Exporter"))
	}

	for _, c := range manifest.Processors {
		occ.Processors = append(occ.Processors, occ.processComponent(c.Gomod, "Processor"))
	}

	for _, c := range manifest.Extensions {
		occ.Extensions = append(occ.Extensions, occ.processComponent(c.Gomod, "Extension"))
	}

	for _, c := range manifest.Providers {
		occ.Providers = append(occ.Providers, occ.processComponent(c.Gomod, "Provider"))
	}

	for _, c := range manifest.Connectors {
		occ.Connectors = append(occ.Connectors, occ.processComponent(c.Gomod, "Connector"))
	}
}

func (occ OtelCollectorComponents) processComponent(module string, componentType string) OtelComponent {
	parsedModule := strings.Split(module, " ") //striping off the version (i.e "v0.111.0")
	moduleUrl := parsedModule[0]
	moduleVersion := parsedModule[1]

	var repoUrl string
	switch {
	case strings.HasPrefix(moduleUrl, "go.opentelemetry.io/collector/"):
		repoUrl = "https://github.com/open-telemetry/opentelemetry-collector"
	case strings.HasPrefix(moduleUrl, "github.com/open-telemetry/opentelemetry-collector-contrib/"):
		repoUrl = "https://github.com/open-telemetry/opentelemetry-collector-contrib"
	default:
		repoUrl = "unknown"
	}

	var componentName string
	if repoUrl != "unknown" {
		componentName = moduleUrl[strings.LastIndex(moduleUrl, "/")+1:] //this gives the position of the last "/" in e.g " go.opentelemetry.io/collector/exporter/debugexporter" -> used to extract component name

		// Strip off the component type if it exists in the name
		componentTypeLower := strings.ToLower(componentType)
		componentName = strings.TrimSuffix(componentName, componentTypeLower)

		if componentType == "Provider" {
			repoUrl = fmt.Sprintf("%s/tree/main/confmap/%s/%s", repoUrl, strings.ToLower(componentType), componentName)
		} else {
			repoUrl = fmt.Sprintf("%s/tree/main/%s/%s", repoUrl, strings.ToLower(componentType), componentName)
		}

	}

	if len(parsedModule) == 2 {
		return OtelComponent{
			Type:      componentType,
			Name:      componentName,
			ModuleUrl: moduleUrl,
			GithubUrl: repoUrl,
			Version:   moduleVersion,
		}
	}

	//If the module was not parsed correctly to a len of 2, we return version "unknown" as we don't know what the version might be
	return OtelComponent{
		Type:      string(componentType),
		Name:      componentName,
		ModuleUrl: moduleUrl,
		GithubUrl: repoUrl,
		Version:   "unknown",
	}
}
