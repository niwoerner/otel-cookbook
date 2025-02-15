package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReadyHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/ready", http.NoBody)

	rr := httptest.NewRecorder()

	th := NewHttpServerTestHelper(t)
	th.ServeHTTP(rr, req)

	require.Equal(t, 200, rr.Code)

	res := th.UnmarshalJsonAndValidateHttpTestResponse(t, rr)
	require.Equal(t, "OK", res["status"], "response 'status' field should match")

}
