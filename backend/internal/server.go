package server

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"text/template"
	"time"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"

	"github.com/gorilla/mux"
	"github.com/patrickmn/go-cache"
	"github.com/rs/cors"
	"go.uber.org/zap"
)

type Config struct {
	Host                  string        `mapstructure:"host"`
	Port                  string        `mapstructure:"port"`
	ServerShutdownTimeout time.Duration `mapstructure:"server-shutdown-timeout"`
}

type Server struct {
	router         *mux.Router
	config         *Config
	logger         *zap.Logger
	cache          *cache.Cache
	cors           *cors.Cors
	templates      *template.Template
	tracer         trace.Tracer
	tracerProvider *sdktrace.TracerProvider

	//Database
	db  *sql.DB
	dbs DbSchema
}

func NewServer(config *Config, logger *zap.Logger, tplPath string) (*Server, error) {

	tmpl, err := template.ParseGlob(tplPath)
	if err != nil {
		return nil, err
	}

	dbName := "otelcol_cookbook_" + os.Getenv("ENV_NAME") + ".db"
	db, dbSchema, err := setupDatabase(dbName)
	if err != nil {
		return nil, err
	}

	srv := &Server{
		router:    mux.NewRouter(),
		config:    config,
		logger:    logger,
		cache:     cache.New(5*time.Minute, 10*time.Minute), //cache expires after 5min and purges expired items after 10min
		templates: tmpl,
		db:        db,
		dbs:       *dbSchema,
	}

	return srv, nil
}

func (s *Server) ListenAndServe() *http.Server {
	ctx := context.Background()

	s.initTracer(ctx)
	s.registerHandlers()
	s.registerMiddlewares()

	srv := s.startServer()

	return srv
}

func (s *Server) registerHandlers() {
	s.router.HandleFunc("/ready", s.readyHandler).Methods("GET")

	// Builder Routes
	s.router.HandleFunc(getOtelComponents, s.getOtelComponentsHandler).Methods("GET")
	s.router.HandleFunc(postOtelBuilderConfig, s.postOtelBuilderConfigHandler).Methods("POST")
	s.router.HandleFunc(postOtelStartConfig, s.postOtelStartConfigHandler).Methods("POST")
	s.router.HandleFunc(getBuilderUsage, s.getBuilderUsageHandler).Methods("GET")

	//Recipe Routes
	s.router.HandleFunc(getRecipeUsage, s.getRecipeUsageHandler).Methods("GET")
	s.router.HandleFunc(postRecipeUsage, s.postRecipeUsageHandler).Methods("POST")
}

func (s *Server) registerMiddlewares() {
	// otel := NewOpenTelemetryMiddleware()
	// s.router.Use(otel)

	httpLogger := NewLoggingMiddleware(s.logger)
	s.router.Use(httpLogger.Handler)

	s.cors = cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})
}

func (s *Server) startServer() *http.Server {
	srv := &http.Server{
		Addr:    s.config.Host + ":" + s.config.Port,
		Handler: s.cors.Handler(s.router),
	}

	go func() {
		s.logger.Info("Starting HTTP Server.", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			s.logger.Fatal("HTTP server crashed", zap.Error(err))
		}
	}()

	return srv
}

// GetTracerProvider returns the TracerProvider for graceful shutdown
func (s *Server) GetTracerProvider() *sdktrace.TracerProvider {
	return s.tracerProvider
}
