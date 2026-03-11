package server

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"text/template"
	"time"

	"github.com/gorilla/mux"
	"github.com/patrickmn/go-cache"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.7.0"
	"go.uber.org/zap"
	"gopkg.in/yaml.v2"
)

const (
	mockServerHost = "localhost"
	mockServerPort = "8888"
)

type TestHelper struct {
	Server *Server
}

func NewHttpServerTestHelper(t *testing.T) *TestHelper {
	config := &Config{
		Host:                  mockServerHost,
		Port:                  mockServerPort,
		ServerShutdownTimeout: 5 * time.Second,
	}

	logger, err := zap.NewDevelopment()
	require.NoError(t, err, "Failed to create logger")

	//ToDo: Find way without relative path
	tmpl, err := template.ParseGlob("../templates/*.tpl")
	require.NoError(t, err, "Failed to parse templates")

	//ToDo: Find way without relative path
	mockDbName := "../otelcol_cookbook_mock.db"
	db, dbSchema, err := setupDatabase(mockDbName)
	require.NoError(t, err, "Failed to create mock db")

	// Initialize metrics for tests
	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String("otel-cookbook-backend-test"),
		)),
	)
	
	otel.SetMeterProvider(meterProvider)
	meter := meterProvider.Meter("otel-cookbook-backend-test")
	
	requestCounter, err := meter.Int64Counter(
		"http_requests_total",
		metric.WithDescription("Total number of HTTP requests"),
		metric.WithUnit("1"),
	)
	require.NoError(t, err, "Failed to create request counter metric")

	srv := &Server{
		router:         mux.NewRouter(),
		logger:         logger,
		config:         config,
		templates:      tmpl,
		cache:          cache.New(5*time.Minute, 10*time.Minute), //cache expires after 5min and purges expired items after 10min
		db:             db,
		dbs:            *dbSchema,
		meterProvider:  meterProvider,
		requestCounter: requestCounter,
	}
	srv.registerHandlers()

	return &TestHelper{Server: srv}
}

// We are implementing the ServeHTTP interface here -> this will allow us to process the request via our mock server
func (th *TestHelper) ServeHTTP(rr *httptest.ResponseRecorder, req *http.Request) {
	th.Server.router.ServeHTTP(rr, req)
}

func (th *TestHelper) UnmarshalJsonAndValidateHttpTestResponse(t *testing.T, rr *httptest.ResponseRecorder) map[string]interface{} {
	var response map[string]interface{}

	err := json.Unmarshal(rr.Body.Bytes(), &response)
	require.NoError(t, err, "response should be valid JSON")

	return response
}

func (th *TestHelper) UnmarshalYamlAndValidateHttpTestResponse(t *testing.T, rr *httptest.ResponseRecorder) interface{} {
	var response interface{}

	err := yaml.Unmarshal(rr.Body.Bytes(), &response)
	require.NoError(t, err, "response should be valid YAML")

	return response
}

func EqualSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	aMap := make(map[string]int)
	bMap := make(map[string]int)
	for _, item := range a {
		aMap[item]++
	}
	for _, item := range b {
		bMap[item]++
	}
	for key, val := range aMap {
		if bMap[key] != val {
			return false
		}
	}
	return true
}

func NewDefaultOtelCollector() *OtelCollector {
	return &OtelCollector{
		BuilderConfig: BuilderConfig{
			Name:        "otel-collector",
			Version:     "1.0.0",
			BuildPath:   "/build",
			Description: "OpenTelemetry Collector",
			OutputPath:  "/output",
			DebugMode:   false,
			RunConfig:   "binary",
		},
		CollectorConfig: CollectorConfig{
			Ports:           "55680,55679",
			PortSlice:       []string{"55680", "55679"},
			DockerImageName: "otel/collector:latest",
			Manifest:        "otelcol.yaml",
		},
		Extensions: []OtelComponent{
			{
				Type:      "extension",
				Name:      "health_check",
				ModuleUrl: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckextension",
				GithubUrl: "https://github.com/open-telemetry/opentelemetry-collector-contrib",
				Version:   "v0.70.0",
			},
		},
		Receivers: []OtelComponent{
			{
				Type:      "receiver",
				Name:      "otlp",
				ModuleUrl: "https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver",
				GithubUrl: "https://github.com/open-telemetry/opentelemetry-collector",
				Version:   "v0.70.0",
			},
		},
		Processors: []OtelComponent{
			{
				Type:      "processor",
				Name:      "batch",
				ModuleUrl: "https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor",
				GithubUrl: "https://github.com/open-telemetry/opentelemetry-collector",
				Version:   "v0.70.0",
			},
		},
		Exporters: []OtelComponent{
			{
				Type:      "exporter",
				Name:      "logging",
				ModuleUrl: "https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/loggingexporter",
				GithubUrl: "https://github.com/open-telemetry/opentelemetry-collector",
				Version:   "v0.70.0",
			},
		},
		Providers: []OtelComponent{
			{
				Type:      "provider",
				Name:      "aws",
				ModuleUrl: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor",
				GithubUrl: "https://github.com/open-telemetry/opentelemetry-collector-contrib",
				Version:   "v0.70.0",
			},
		},
	}
}

func generateTestReqBody(t *testing.T, baseCollector *OtelCollector, updates func(*OtelCollector)) []byte {
	updatedCollector := *baseCollector

	if updates != nil {
		updates(&updatedCollector)
	}

	jsonBody, err := json.Marshal(updatedCollector)
	require.NoError(t, err)

	return jsonBody
}

func generateTestOtelcol(baseCollector *OtelCollector, updates func(*OtelCollector)) *OtelCollector {
	updatedCollector := *baseCollector

	if updates != nil {
		updates(&updatedCollector)
	}

	return &updatedCollector
}

func NewMockTransport(handler func(req *http.Request) *http.Response) http.RoundTripper {
	return &mockTransport{handler: handler}
}

type mockTransport struct {
	handler func(req *http.Request) *http.Response
}

func (m *mockTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	return m.handler(req), nil
}
