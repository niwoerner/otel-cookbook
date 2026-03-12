package server

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.opentelemetry.io/otel"
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

var requestCounter metric.Int64Counter

func init() {
	meter := otel.Meter("otel-cookbook-backend")
	var err error
	requestCounter, err = meter.Int64Counter(
		"http_requests_total",
		metric.WithDescription("Total number of HTTP requests"),
	)
	if err != nil {
		// Handle error - in production you might want to log this properly
		panic(fmt.Sprintf("failed to create request counter: %v", err))
	}
}

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

	s.logger.Info("Successfully generated the otel builder config")
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

	requestCounter.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("status", "success"),
		attribute.String("operation", "builder_usage"),
	))
}
