package server

const (
	// Base path for all /server routes
	basePath = "/server"

	// Builder Routes
	getOtelComponents     = basePath + "/otelcol/components"
	postOtelBuilderConfig = basePath + "/otelcol/config/builder"
	postOtelStartConfig   = basePath + "/otelcol/config/start"
	getBuilderUsage       = basePath + "/otelcol/builder/usage"

	// Recipe Routes
	getRecipeUsage  = basePath + "/otelcol/recipes/usage"
	postRecipeUsage = basePath + "/otelcol/recipes/usage"
)
