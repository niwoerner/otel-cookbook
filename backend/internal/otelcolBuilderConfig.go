package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type BuilderConfig struct {
	Name        string `json:"collectorName"`
	Version     string `json:"version"`
	BuildPath   string `json:"build_path"`
	Description string `json:"description"`
	OutputPath  string `json:"outputPath"`
	DebugMode   bool   `json:"debugMode"`
	RunConfig   string `json:"runConfig"`
}

const (
	postOtelBuilderConfigErrMsg = "Error while creating the otel builder config"
	getBuilderUsageErrMsg       = "Error while returning the otel builder usage"
)

func (s *Server) postOtelBuilderConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/x-yaml")

	var colCfg OtelCollector
	err := json.NewDecoder(r.Body).Decode(&colCfg)
	if err != nil {
		s.ErrorResponse(w, r, "Invalid JSON body", http.StatusBadRequest)
		s.logger.Sugar().Errorf("%s: Error decoding request JSON body", postOtelBuilderConfigErrMsg)
		return
	}

	if err := s.templates.ExecuteTemplate(w, "builder", colCfg); err != nil {
		s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
		s.logger.Sugar().Errorf("%s: Error streaming generated YAML output to client", postOtelBuilderConfigErrMsg)
		return
	}

	currentTime := time.Now()
	sqlValues := fmt.Sprintf("NULL, '%s', '%s'",
		colCfg.BuilderConfig.Name,
		currentTime.Format("2006-01-02 15:04:05"),
	)

	err = insertIntoTable(s.db, s.dbs.builderUsageTable, sqlValues)
	if err != nil {
		s.db.Close()
		s.logger.Sugar().Errorf("%s: Something went wrong while inserting to db", postOtelBuilderConfigErrMsg)
		return
	}

	s.requestCounter.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("status", "success"),
		attribute.String("operation", "builder_config"),
	))
}

func (s *Server) getBuilderUsageHandler(w http.ResponseWriter, r *http.Request) {
	query := "SELECT COUNT(*) FROM builder_usage"
	row := s.db.QueryRow(query)

	var count int
	if err := row.Scan(&count); err != nil {
		s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
		s.logger.Sugar().Errorf("%s: Error saving builder usage event to db", getBuilderUsageErrMsg)
		return
	}

	response := map[string]int{
		"count": count,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
		s.logger.Sugar().Errorf("%s: Error streaming generated YAML output to client", getBuilderUsageErrMsg)
	}

	s.logger.Info("Successfully saved the otel builder usage")
}
