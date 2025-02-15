package server

import (
	"encoding/json"
	"net/http"
	"strings"
)

const (
	defaultGrpcPort           = "4317"
	defaultHttpPort           = "4318"
	postOtelStartConfigErrMsg = "Error while creating the otel start config"
)

func (s *Server) postOtelStartConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")

	var colCfg OtelCollector
	err := json.NewDecoder(r.Body).Decode(&colCfg)
	if err != nil {
		s.ErrorResponse(w, r, "Invalid JSON body", http.StatusBadRequest)
		s.logger.Sugar().Errorf("%s: Error decoding request JSON body", postOtelStartConfigErrMsg)
		return
	}

	// 1. We remove trailing commas at the end of the string
	// 2. We replace commas with spaces to match the expected Dockerfile synatax like "EXPOSE 4317 55680 55679"
	fmtPorts := strings.ReplaceAll(strings.TrimSuffix(colCfg.CollectorConfig.Ports, ","), ",", " ")
	colCfg.CollectorConfig.PortSlice = strings.Fields(fmtPorts)

	if colCfg.BuilderConfig.DebugMode {
		defaultDebugPorts := []string{defaultGrpcPort, defaultHttpPort}
		for _, port := range defaultDebugPorts {
			if !sliceContains(colCfg.CollectorConfig.PortSlice, port) {
				colCfg.CollectorConfig.PortSlice = append(colCfg.CollectorConfig.PortSlice, port)
			}
		}
	}

	if err := s.templates.ExecuteTemplate(w, "run", colCfg); err != nil {
		s.ErrorResponse(w, r, "Error generating output", http.StatusInternalServerError)
		s.logger.Sugar().Errorf("%s: Error streaming generated YAML output to client", postOtelStartConfigErrMsg)
	}

	s.logger.Info("Successfully generated the otel start config")
}
