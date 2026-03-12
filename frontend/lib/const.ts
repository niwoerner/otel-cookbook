import { RunConfig } from "@/app/models/otel.builder.config.model";

// Urls
export const otelBuilderGHRepo = "https://github.com/niwoerner/otel-builder-test";
export const addRecipeReadMeSectionGHRepo = otelBuilderGHRepo + "?tab=readme-ov-file#adding-a-recipe"
export const GHRepoPath = "niwoerner/otel-builder-test";

// EnvVars
export const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8888';  // EnvVars with prefix NEXT_PUBLIC_ will be present client-side, too
export const SERVER_SIDE_BACKEND_URL = process.env.SERVER_SIDE_BACKEND_URL || 'http://localhost:8888'; 

// Backend API routes
const backendBasePath = "/server"
export const getOtelcolComponents = backendBasePath + "/otelcol/components"
export const postOtelcolBuilderConfig = backendBasePath +"/otelcol/config/builder"
export const postOtelcolStartConfig = backendBasePath +"/otelcol/config/start"
export const postOtelcolConfigToSchemaJson = backendBasePath +"/otelcol/config/convert"
export const getRecipeUsageCount = backendBasePath +"/otelcol/recipes/usage"
export const postRecipeUsage = backendBasePath +"/otelcol/recipes/usage"
export const getBuilderUsageCount = backendBasePath +"/otelcol/builder/usage"

// Default collector config
export const defaultCollectorConfig = {
    collectorName: "my-otel-collector" as const, // 'as const' ensures it stays a literal type
    description: "collector description" as const,
    outputPath: "./otelcol-dev" as const,
    debugMode: false as const,
    runConfig: "binary" as RunConfig,
  };