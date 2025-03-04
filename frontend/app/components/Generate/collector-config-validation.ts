import { Diagnostic } from "@codemirror/lint";
import Ajv, { ValidateFunction } from "ajv";
import addErrors from "ajv-errors";
import YAML from "yaml";
import { IOtelConfig, schema } from "./collector-validation-json-schema";
import { OtelCollector } from "@/app/models/otel.builder.config.model";

export interface LintError extends Diagnostic {
  severity: "error" | "warning";
}

interface ValidationProps {
  yaml: string;
  setLintErrors: React.Dispatch<React.SetStateAction<Diagnostic[]>>;
}

const ajv = new Ajv({ allErrors: true, verbose: true, strict: true });
addErrors(ajv);
const validate: ValidateFunction = ajv.compile(schema);

export function validateCollectorConfig({
  yaml,
  setLintErrors,
}: ValidationProps): void {
  try {
    const config = YAML.parse(yaml);
    const isValid = validate(config);

    if (!isValid && validate.errors) {
      const lines = yaml.split("\n");

      const lintErrors = validate.errors.map((error) => {
        const pathSegments = (error.instancePath || error.schemaPath)
          .split("/")
          .filter(Boolean);

        let currentIndent = -1;
        let currentPath: string[] = [];
        let errorLine = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmedLine = line.trimStart();
          const indent = line.length - trimmedLine.length;

          // comments will be skipped
          if (!trimmedLine || trimmedLine.startsWith("#")) continue;

          const keyMatch = trimmedLine.match(/^([\w-]+):/);
          if (!keyMatch) continue;

          const key = keyMatch[1];

          if (indent <= currentIndent) {
            while (currentPath.length > 0 && currentPath.length > indent / 2) {
              currentPath.pop();
            }
          }
          currentPath = [...currentPath, key];

          const isMatch =
            pathSegments.every((segment, index) => {
              if (index >= currentPath.length) return false;
              if (!isNaN(Number(segment))) return true;
              return currentPath[index] === segment;
            }) && pathSegments.length === currentPath.length;

          if (isMatch) {
            errorLine = i;
            break;
          }

          currentIndent = indent;
        }

        if (errorLine === -1) {
          errorLine = lines.length - 1;
        }

        const start = lines
          .slice(0, errorLine)
          .reduce((sum, line) => sum + line.length + 1, 0);
        const end = start + lines[errorLine].length;

        return {
          from: start,
          to: end,
          severity: "error" as const,
          message: `${
            pathSegments.length > 0 ? pathSegments.join(" → ") : "root"
          }: ${error.message || "Validation error"}`,
        };
      });

      setLintErrors(lintErrors);
    } else {
      setLintErrors([]);
    }
  } catch (error) {
    setLintErrors([
      {
        from: 0,
        to: yaml.length,
        severity: "error",
        message: `Invalid YAML: ${(error as Error).message}`,
      },
    ]);
  }
}

interface CollectorConfigParserProps {
  yaml: string;
}

export function parseCollectorConfigComponents({
  yaml,
}: CollectorConfigParserProps): IOtelConfig {
  const config = YAML.parse(yaml);

  const receivers = config?.receivers ? Object.keys(config.receivers) : [];
  const exporters = config?.exporters ? Object.keys(config.exporters) : [];
  const processors = config?.processors ? Object.keys(config.processors) : [];
  const extensions = config?.extensions ? Object.keys(config.extensions) : [];
  const connectors = config?.connectors ? Object.keys(config.connectors) : [];
  const providers = config?.providers ? Object.keys(config.providers) : [];

  return {
    receivers,
    exporters,
    processors,
    extensions,
    connectors,
    providers,
    service: config?.service || {}, // service will be kept empty, since this is not required during the component extaction
  };
}

export function checkComponentsConfigured(
  parsedConfig: IOtelConfig | null,
  otelCollector: OtelCollector
): {
  isMissingInBuilderConfig: boolean;
  isMissingInCollectorConfig: boolean;
  missingInBuilderConfig: Record<string, string[]>;
  missingInCollectorConfig: Record<string, string[]>;
} {
  if (!parsedConfig) {
    return {
      isMissingInBuilderConfig: false,
      isMissingInCollectorConfig: false,
      missingInBuilderConfig: {},
      missingInCollectorConfig: {}
    };
  }

  const missingInBuilderConfig: Record<string, string[]> = {};
  const missingInCollectorConfig: Record<string, string[]> = {};

  const checkComponentType = (
    components: { name: string }[],
    configKey: keyof IOtelConfig
  ) => {
    const selectedComponents = components.map((comp) => comp.name);
    const configuredComponents = Object.values(parsedConfig[configKey]);

    // Find components that are in the builder config but not in the collector config
    const missingInConfig = selectedComponents.filter(
      (selectedName) =>
        !configuredComponents.some((configName) =>
          configName.includes(selectedName)
        )
    );
    if (missingInConfig.length > 0) {
      missingInCollectorConfig[configKey] = missingInConfig;
    }

    // Find components that are in config but not selected
    const notSelected = configuredComponents.filter(
      (name) => !selectedComponents.includes(name)
    );
    if (notSelected.length > 0) {
      missingInBuilderConfig[configKey] = notSelected;
    }
  };

  checkComponentType(otelCollector.Receivers, "receivers");
  checkComponentType(otelCollector.Exporters, "exporters");
  checkComponentType(otelCollector.Processors, "processors");
  checkComponentType(otelCollector.Extensions, "extensions");
  checkComponentType(otelCollector.Connectors, "connectors");

  return {
    isMissingInBuilderConfig: Object.keys(missingInBuilderConfig).length > 0,
    isMissingInCollectorConfig: Object.keys(missingInCollectorConfig).length > 0,
    missingInBuilderConfig,
    missingInCollectorConfig
  };
}
