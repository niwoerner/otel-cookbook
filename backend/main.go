package main

import (
	"log"
	"os"
	server "otel-builder/internal"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func main() {
	// load config
	cfgPath := "./config/"
	cfgName := "server.yaml"
	fileType := filepath.Ext(cfgName)

	_, err := os.Stat(filepath.Join(cfgPath, cfgName))
	if err != nil {
		log.Fatalf("Error loading config file, %v\n", err)
	}

	viper.AddConfigPath(cfgPath)
	viper.SetConfigName(strings.TrimSuffix(cfgName, fileType))
	err = viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Error reading config file, %v\n", err)
	}

	// configure logging
	var zapLevel zapcore.Level
	logLevel := viper.GetString("log-level")
	logConfig := zap.NewProductionConfig()

	err = zapLevel.UnmarshalText([]byte(logLevel))
	if err != nil {
		log.Fatalf("Error setting log level, %v\n", err)
	}

	logConfig.Level = zap.NewAtomicLevelAt(zapLevel)
	logger, err := logConfig.Build()
	if err != nil {
		log.Fatalf("can't initialize zap logger: %v", err)
	}

	// load server config
	var srvCfg server.Config
	if err := viper.Unmarshal(&srvCfg); err != nil {
		logger.Panic("config unmarshal failed", zap.Error(err))
	}

	logger.Info("Starting http-server",
		zap.String("version", viper.GetString("version")),
		zap.String("port", srvCfg.Port),
	)

	// start server
	srv, err := server.NewServer(&srvCfg, logger, "./templates/*.tpl")
	if err != nil {
		logger.Panic("config create a new server", zap.Error(err))
	}
	httpSrv := srv.ListenAndServe()

	// graceful shutdown
	stopCh := server.SetupSignalHandler()
	sd, _ := server.NewShutdown(srvCfg.ServerShutdownTimeout, logger)
	sd.Graceful(stopCh, httpSrv)
}
