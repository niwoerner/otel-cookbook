package server

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gopkg.in/yaml.v2"
)

const (
	tplName = "run"
)

func TestPostOtelStartConfigHandler(t *testing.T) {
	th := NewHttpServerTestHelper(t)

	defaultOtelCol := NewDefaultOtelCollector()

	tests := []struct {
		name            string
		httpMethod      string
		reqBody         []byte
		otelCol         *OtelCollector
		expectedPorts   []string
		expectedResBody map[string]interface{}
		statusCode      int
	}{
		{
			name:       "unsupported HTTP method",
			httpMethod: http.MethodGet,
			reqBody:    nil,
			statusCode: http.StatusMethodNotAllowed,
		},
		{
			name:       "invalid JSON request body",
			httpMethod: http.MethodPost,
			reqBody:    []byte("invalid req body"),
			expectedResBody: map[string]interface{}{
				"code":    float64(400),
				"message": "Invalid JSON body",
			}, statusCode: http.StatusOK,
		},
		{
			name:       "valid request run mode binary without debug mode",
			httpMethod: http.MethodPost,
			reqBody: generateTestReqBody(t, defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "binary"
				col.BuilderConfig.DebugMode = false
			}),
			otelCol: generateTestOtelcol(defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "binary"
				col.BuilderConfig.DebugMode = false
			}),
			statusCode: http.StatusOK,
		},
		{
			name:       "valid request run mode binary with debug mode",
			httpMethod: http.MethodPost,
			reqBody: generateTestReqBody(t, defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "binary"
				col.BuilderConfig.DebugMode = true
			}),
			otelCol: generateTestOtelcol(defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "binary"
				col.BuilderConfig.DebugMode = true
			}),
			statusCode: http.StatusOK,
		},
		{
			name:       "valid request run mode docker without debug mode",
			httpMethod: http.MethodPost,
			reqBody: generateTestReqBody(t, defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "docker"
				col.BuilderConfig.DebugMode = false
				col.CollectorConfig.Ports = "55680,55679"
			}),
			otelCol: generateTestOtelcol(defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "docker"
				col.BuilderConfig.DebugMode = false
				col.CollectorConfig.Ports = "55680,55679"
			}),
			statusCode: http.StatusOK,
		},
		{
			name:       "valid request run mode docker with debug mode",
			httpMethod: http.MethodPost,
			reqBody: generateTestReqBody(t, defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "docker"
				col.BuilderConfig.DebugMode = true
				col.CollectorConfig.Ports = "55680,55679"
				col.CollectorConfig.PortSlice = []string{defaultGrpcPort, defaultHttpPort, "55680", "55679"}
			}),
			otelCol: generateTestOtelcol(defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "docker"
				col.BuilderConfig.DebugMode = true
				col.CollectorConfig.Ports = "55680,55679"
				col.CollectorConfig.PortSlice = []string{"55680", "55679", defaultGrpcPort, defaultHttpPort}
			}),
			statusCode: http.StatusOK,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.httpMethod, postOtelStartConfig, bytes.NewReader(tc.reqBody))
			req.Header.Set("Content-Type", "application/json")

			rr := httptest.NewRecorder()
			th.ServeHTTP(rr, req)

			var expectedBuffer bytes.Buffer
			var expectedResBody interface{}

			// if an otelcollector was defined in a test case, we expected a yaml as response. If not, it will be a json response indicating an error
			if tc.otelCol != nil {
				res := th.UnmarshalYamlAndValidateHttpTestResponse(t, rr)

				err := th.Server.templates.ExecuteTemplate(&expectedBuffer, tplName, tc.otelCol)
				require.NoError(t, err)

				err = yaml.Unmarshal(expectedBuffer.Bytes(), &expectedResBody)
				require.NoError(t, err, "response should be valid YAML")

				assert.EqualValues(t, expectedResBody, res)
			} else {
				if rr.Body.Bytes() != nil {
					res := th.UnmarshalJsonAndValidateHttpTestResponse(t, rr)
					assert.EqualValues(t, tc.expectedResBody, res)
				}
			}
			assert.EqualValues(t, tc.statusCode, rr.Code)

			if tc.statusCode == http.StatusOK && len(tc.expectedPorts) > 0 {
				for _, p := range tc.expectedPorts {
					assert.Contains(t, expectedResBody, p) //we check if the ouput contains all expected ports
				}
			}
		})
	}
}
