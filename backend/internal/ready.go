package server

import (
	"net/http"
)

func (s *Server) readyHandler(w http.ResponseWriter, r *http.Request) {
	s.JSONResponse(w, r, map[string]string{"status": "OK"})
}
