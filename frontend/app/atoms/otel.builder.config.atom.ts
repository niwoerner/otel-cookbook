import { defaultCollectorConfig } from "@/lib/const";
import { atomWithReset } from "jotai/utils";
import { ComponentType, OtelCollector, OtelComponent } from "../models/otel.builder.config.model";

// OtelCollector is the structure which is passed to the backend to generate the yaml manifest (= otel builder config)
// Jotai is used for state management and therefore the struct gets stored in an Atom
export const otelCollectorAtom = atomWithReset<OtelCollector>({
  BuilderConfig: {
    collectorName: defaultCollectorConfig.collectorName,
    version: "",
    description: defaultCollectorConfig.description,
    outputPath: defaultCollectorConfig.outputPath,
    debugMode: defaultCollectorConfig.debugMode,
    runConfig: defaultCollectorConfig.runConfig,
  },
  CollectorConfig: {
    Ports: "",
    DockerImageName: "",
    Manifest: "",
  },
  Receivers: [],
  Exporters: [],
  Processors: [],
  Extensions: [],
  Providers: [],
  Connectors: [],
});

export const componentConfigAtom = atomWithReset<OtelComponent>({
  type: "" as ComponentType,
  name: "",
  moduleUrl: "",
  githubUrl: "",
  version: "",
});