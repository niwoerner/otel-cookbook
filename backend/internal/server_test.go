package server

import (
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	exitCode := m.Run()

	err := os.Remove("otelcol_cookbook_mock.db")
	if err != nil {
		panic("failed to clean up mock db")
	}

	os.Exit(exitCode)
}
