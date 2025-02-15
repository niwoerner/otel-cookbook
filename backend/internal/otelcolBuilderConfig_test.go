package server

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPostOtelBuilderConfigHandler(t *testing.T) {
	th := NewHttpServerTestHelper(t)

	defaultOtelCol := NewDefaultOtelCollector()

	tests := []struct {
		name            string
		httpMethod      string
		reqBody         []byte
		expectedResBody map[string]interface{}
		statusCode      int
		otelCol         *OtelCollector
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
			name:       "valid request with default OtelCollector",
			httpMethod: http.MethodPost,
			reqBody: generateTestReqBody(t, defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "binary"
			}),
			otelCol: generateTestOtelcol(defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "binary"
			}),
			statusCode: http.StatusOK,
		},
		{
			name:       "valid request with modified OtelCollector",
			httpMethod: http.MethodPost,
			reqBody: generateTestReqBody(t, defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "docker"
				col.BuilderConfig.DebugMode = true
			}),
			otelCol: generateTestOtelcol(defaultOtelCol, func(col *OtelCollector) {
				col.BuilderConfig.RunConfig = "docker"
				col.BuilderConfig.DebugMode = true
			}),
			statusCode: http.StatusOK,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.httpMethod, postOtelBuilderConfig, bytes.NewReader(tc.reqBody))
			req.Header.Set("Content-Type", "application/json")

			rr := httptest.NewRecorder()
			th.ServeHTTP(rr, req)

			var expectedBuffer bytes.Buffer
			var expectedResBody interface{}

			// if an otelcollector was defined in a test case, we expected a yaml as response. If not, it will be a json response indicating an error
			if tc.otelCol != nil {
				err := th.Server.templates.ExecuteTemplate(&expectedBuffer, "builder", tc.otelCol)
				require.NoError(t, err)

				expectedResBody = expectedBuffer.String()
				assert.EqualValues(t, expectedResBody, rr.Body.String())

			} else {
				if rr.Body.Bytes() != nil {
					res := th.UnmarshalJsonAndValidateHttpTestResponse(t, rr)
					assert.EqualValues(t, tc.expectedResBody, res)
				}
			}
			assert.Equal(t, tc.statusCode, rr.Code)
		})
	}
}
