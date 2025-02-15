import { Diagnostic } from "@codemirror/lint";
import Ajv, { ValidateFunction } from "ajv";
import addErrors from "ajv-errors";
import YAML from "yaml";
import { schema } from "./collector-validation-json-schema";

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
