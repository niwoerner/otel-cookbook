package server

import (
	"context"
	"net/http"
	"time"

	"go.uber.org/zap"
)

type Shutdown struct {
	logger                *zap.Logger
	serverShutdownTimeout time.Duration
}

func NewShutdown(serverShutdownTimeout time.Duration, logger *zap.Logger) (*Shutdown, error) {
	sd := &Shutdown{
		logger:                logger,
		serverShutdownTimeout: serverShutdownTimeout,
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

	// determine if the http server was started
	if httpServer != nil {
		if err := httpServer.Shutdown(ctx); err != nil {
			s.logger.Warn("HTTP server graceful shutdown failed", zap.Error(err))
		}
	}

}
