package server

import (
	"context"
	"net/http"
	"time"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.uber.org/zap"
)

type Shutdown struct {
	logger                *zap.Logger
	serverShutdownTimeout time.Duration
	tracerProvider        *sdktrace.TracerProvider
}

func NewShutdown(serverShutdownTimeout time.Duration, logger *zap.Logger, tracerProvider *sdktrace.TracerProvider) (*Shutdown, error) {
	sd := &Shutdown{
		logger:                logger,
		serverShutdownTimeout: serverShutdownTimeout,
		tracerProvider:        tracerProvider,
	}

	return sd, nil
}

func (s *Shutdown) Graceful(stopCh <-chan struct{}, httpServer *http.Server) {
	ctx := context.Background()

	// wait for SIGTERM or SIGINT
	<-stopCh
	ctx, cancel := context.WithTimeout(ctx, s.serverShutdownTimeout)
	defer cancel()

	s.logger.Info("Shutting down HTTP/HTTPS server", zap.Duration("timeout", s.serverShutdownTimeout))

	// Shutdown TracerProvider first to ensure spans are flushed
	if s.tracerProvider != nil {
		if err := s.tracerProvider.Shutdown(ctx); err != nil {
			s.logger.Warn("TracerProvider graceful shutdown failed", zap.Error(err))
		} else {
			s.logger.Info("TracerProvider shutdown completed successfully")
		}
	}

	// determine if the http server was started
	if httpServer != nil {
		if err := httpServer.Shutdown(ctx); err != nil {
			s.logger.Warn("HTTP server graceful shutdown failed", zap.Error(err))
		}
	}

}
