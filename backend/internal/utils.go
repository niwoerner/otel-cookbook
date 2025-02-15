package server

import (
	"bytes"
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
)

func (s *Server) JSONResponse(w http.ResponseWriter, r *http.Request, result interface{}) {
	body, err := json.Marshal(result)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		s.logger.Error("JSON marshal failed", zap.Error(err))
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)

	pj, err := prettyJSON(body)
	if err != nil {
		s.logger.Sugar().Errorf("%s: Error formating response json", err.Error())
		return
	}

	_, err = w.Write(pj)
	if err != nil {
		s.logger.Sugar().Errorf("%s: Error sending JSON error response to user", err.Error())
		return
	}
}

func (s *Server) ErrorResponse(w http.ResponseWriter, r *http.Request, error string, code int) {
	data := struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	}{
		Code:    code,
		Message: error,
	}

	body, err := json.Marshal(data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		s.logger.Error("JSON marshal failed", zap.Error(err))
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)

	pj, err := prettyJSON(body)
	if err != nil {
		s.logger.Sugar().Errorf("%s: Error formating response json", err.Error())
		return
	}

	_, err = w.Write(pj)
	if err != nil {
		s.logger.Sugar().Errorf("%s: Error sending JSON error response to user", err.Error())
		return
	}
}

func prettyJSON(b []byte) ([]byte, error) {
	var out bytes.Buffer
	err := json.Indent(&out, b, "", "  ")
	if err != nil {
		return nil, err
	}
	return out.Bytes(), nil
}

func sliceContains[T comparable](slice []T, item T) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}
