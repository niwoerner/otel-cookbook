export type OtelCollector = {
    BuilderConfig: BuilderConfig;
    CollectorConfig: CollectorConfig; 
    Receivers: OtelComponent[]; 
    Exporters: OtelComponent[]; 
    Processors: OtelComponent[]; 
    Extensions: OtelComponent[]; 
    Connectors: OtelComponent[]; 
    Providers: OtelComponent[]; 
  };
  
export type BuilderConfig = {
  collectorName: string;
  version: string;
  description: string,
  outputPath: string;
  debugMode: boolean; 
  runConfig: RunConfig
};

export type CollectorConfig = {
  Ports: string
  DockerImageName: string 
  Manifest: string
}

export type OtelComponent = {
  type: ComponentType;
  name: string;
  moduleUrl: string;
  githubUrl: string;
  version: string;
};

export type ComponentType = 'Receiver' | 'Exporter' | 'Processor' | 'Provider' | 'Connector' | 'Extension'

export type RunConfig = "binary" | "docker" ;

export const isNoComponentsSelected = (config: OtelCollector): boolean => {
  const componentKeys: (keyof OtelCollector)[] = [
    "Receivers",
    "Exporters",
    "Processors",
    "Extensions",
    "Connectors",
    "Providers",
  ];

  return componentKeys.every(
    (key) => Array.isArray(config[key]) && config[key].length === 0
  );
};