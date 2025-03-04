"use client";
import { otelCollectorAtom } from "@/app/atoms/otel.builder.config.atom";
import { isNoComponentsSelected } from "@/app/models/otel.builder.config.model";
import { yaml } from "@codemirror/lang-yaml";
import { Diagnostic, linter } from "@codemirror/lint";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CogIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import { useAtom } from "jotai";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  checkComponentsConfigured,
  parseCollectorConfigComponents,
  validateCollectorConfig,
} from "./collector-config-validation";
import CollectorConfigWarningPopup from "./collector-config-warning-popup";
import { IOtelConfig } from "./collector-validation-json-schema";

interface CollectorConfigPopupProps {
  openPopup: boolean;
  setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export const minimalDebugCollectorConfig = `# Minimal OpenTelemetry Collector Configuration
receivers:
  otlp:
    protocols:
      grpc: 
        endpoint: "0.0.0.0:4317" # Shouldn't be used on prod to protect against DoS attacks: https://opentelemetry.io/docs/security/config-best-practices/#protect-against-denial-of-service-attacks
      http: 
        endpoint: "0.0.0.0:4318" # Shouldn't be used on prod to protect against DoS attacks: https://opentelemetry.io/docs/security/config-best-practices/#protect-against-denial-of-service-attacks

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]`;

const defaultCollectorConfig = `# Paste your OpenTelemetry collector config here. 
# Enable debug mode for a minimal config as blueprint.
    
















    `;

export default function CollectorConfigPopup({
  openPopup,
  setOpenPopup,
}: CollectorConfigPopupProps) {
  const [lintErrors, setLintErrors] = useState<Diagnostic[]>([]);
  const lintExtension = linter(() => lintErrors);
  const [otelCollector, setOtelCollector] = useAtom(otelCollectorAtom);
  const [configYaml, setConfigYaml] = useState(defaultCollectorConfig);
  const [ports, setPorts] = useState("4317"); //default otel port
  const [dockerImageName, setDockerImageName] = useState(
    otelCollector.BuilderConfig.collectorName
  );
  const [showConfigWarning, setShowConfigWarning] = useState(false);

  useEffect(() => {
    // only overwrite if the default config is in place - we don't want to overwrite user input when debug mode gets changed
    if (
      configYaml == defaultCollectorConfig ||
      configYaml == minimalDebugCollectorConfig
    ) {
      setConfigYaml(
        otelCollector?.BuilderConfig?.debugMode
          ? minimalDebugCollectorConfig
          : defaultCollectorConfig
      );
    }
  }, [otelCollector.BuilderConfig.debugMode]);

  const handleCodeChange = (code: string) => {
    setConfigYaml(code);
    validateCollectorConfig({
      yaml: code,
      setLintErrors,
    });
  };

  const validatePorts = (value: string) => {
    const regex = /^\d+(,\d+)*$/; // look for numbers separated by commas, no trailing commas

    if (value.endsWith(",")) {
      setShowConfigWarning(false);
      return true;
    }

    if (!value || regex.test(value)) {
      setShowConfigWarning(false);
      return true;
    } else {
      setShowConfigWarning(true);
      return false;
    }
  };

  const handlePortsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validatePorts(value)) {
      setPorts(value);
    }
  };

  const handleApplyConfiguration = () => {
    setOtelCollector((prev) => ({
      ...prev,
      CollectorConfig: {
        ...prev.CollectorConfig,
        Ports: ports,
        DockerImageName: prev.BuilderConfig.collectorName,
        Manifest: configYaml,
      },
    }));
    setOpenPopup(false);
    redirect("/preview");
  };

  const [showNoSelectionWarning, setShowNoSelectionWarning] = useState(false);
  const [missingInBuilderConfig, setMissingInBuilderConfig] = useState(false);
  const [missingInCollectorConfig, setMissingInCollectorConfig] =
    useState(false);
  const [missingBuilderComponents, setMissingBuilderComponents] = useState<
    Record<string, string[]>
  >({});
  const [missingCollectorComponents, setMissingCollectorComponents] = useState<
    Record<string, string[]>
  >({});

  const handleApplyClick = () => {
    if (
      isNoComponentsSelected(otelCollector) &&
      !otelCollector.BuilderConfig.debugMode
    ) {
      setShowNoSelectionWarning(true);
    } else {
      const parsedComponents = parseCollectorConfigComponents({
        yaml: configYaml,
      });
      const {
        isMissingInBuilderConfig,
        isMissingInCollectorConfig,
        missingInBuilderConfig,
        missingInCollectorConfig,
      } = checkComponentsConfigured(parsedComponents, otelCollector);

      if (isMissingInBuilderConfig) {
        setMissingInBuilderConfig(true);
        setMissingBuilderComponents(missingInBuilderConfig);
      } else if (isMissingInCollectorConfig) {
        setMissingInCollectorConfig(true);
        setMissingCollectorComponents(missingInCollectorConfig);
      } else {
        handleApplyConfiguration();
      }
    }
  };

  return (
    <Dialog open={openPopup} onClose={setOpenPopup} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl sm:p-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="max-w-3xl mx-auto">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-100">
                <CogIcon aria-hidden="true" className="size-8 text-blue-600" />
              </div>

              <div className="mt-4 text-center sm:mt-6">
                <DialogTitle
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Collector Configuration
                </DialogTitle>

                {otelCollector.BuilderConfig.runConfig === "docker" && (
                  <div className="mt-8 text-left">
                    <h4 className="text-lg font-medium text-gray-900">
                      Docker Configuration
                    </h4>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="grpc-port"
                          className="block text-md font-medium text-gray-700"
                        >
                          Ports (as comma separated list)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="ports"
                            value={ports}
                            onChange={handlePortsChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-md"
                            placeholder={ports}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="docker-image-name"
                          className="block text-md font-medium text-gray-700"
                        >
                          Image Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="docker-image-name"
                            value={dockerImageName}
                            onChange={(e) => setDockerImageName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-md"
                            placeholder={
                              otelCollector.BuilderConfig.collectorName
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Collector YAML Configuration Section */}
                <div className="mt-8 text-left">
                  <h4 className="text-lg font-medium text-gray-900">
                    YAML Configuration
                  </h4>
                  <div className="mt-2">
                    <div className="flex items-start space-x-3 rounded-md bg-amber-50/50 px-3 py-2 text-sm">
                      <ExclamationTriangleIcon className="mt-0.5 size-4 flex-shrink-0 text-amber-500" />
                      <p className="text-amber-800">
                        <span className="font-medium">Note:</span> The debug
                        configuration includes the{" "}
                        <span className="font-semibold">otlp-receiver</span> and
                        the{" "}
                        <span className="font-semibold">debug-exporter</span>.
                        They will be added to your selected components and port{" "}
                        <span className="font-semibold">4317</span> and{" "}
                        <span className="font-semibold">4318</span> will be
                        exposed by default.
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-md text-gray-600">
                    You can create and validate your configuration below. Use{" "}
                    <a
                      href="https://github.com/open-telemetry/opentelemetry-collector-releases"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      otelbin{" "}
                    </a>
                    for more comprehensive validation capabilities.{" "}
                  </p>
                  <div className="mt-4">
                    <div className="rounded-lg border border-gray-500 p-2 bg-gray-800 min-h-[239px] md:min-h-[439px]">
                      <CodeMirror
                        value={configYaml}
                        extensions={[yaml(), lintExtension]}
                        className="rounded-md border-none p-3 text-gray-200 font-mono text-sm bg-transparent "
                        onChange={handleCodeChange}
                        theme={dracula}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-4">
              <button
                type="button"
                onClick={handleApplyClick}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
              >
                Apply Configuration
              </button>
              <button
                type="button"
                onClick={() => setOpenPopup(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2.5 text-base font-semibold text-black-600 shadow-sm  ring-inset  ring-1 ring-gray-300  hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              >
                Back
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
      <CollectorConfigWarningPopup
        type="warning"
        heading={"Invalid Configuration"}
        description={
          "Ports must be integers, separated by commas (e.g., 4317,4318) and not be empty."
        }
        buttonText={"Back"}
        open={showConfigWarning}
        setOpenPopup={setShowConfigWarning}
      />
      <CollectorConfigWarningPopup
        type="warning"
        heading="No Components Selected"
        description="You have not selected any components. Please select at least one component to continue."
        buttonText="Back"
        open={showNoSelectionWarning}
        setOpenPopup={setShowNoSelectionWarning}
      />
      <CollectorConfigWarningPopup
        type="warning"
        heading="Missing Components in Builder Config"
        description="Some components in the Collector config are not selected in the builder. This may cause unexpected behavior."
        buttonText="Back"
        allowContinue={true}
        onContinue={handleApplyConfiguration}
        continueButtonText="Continue"
        open={missingInBuilderConfig}
        setOpenPopup={setMissingInBuilderConfig}
        missingInBuilderConfig={missingBuilderComponents}
      />
      <CollectorConfigWarningPopup
        type="warning"
        heading="Missing Components in Collector Config"
        description="Some components are configured in the builder config but not in the collector. This may cause unexpected behavior."
        buttonText="Back"
        allowContinue={true}
        onContinue={handleApplyConfiguration}
        continueButtonText="Continue"
        open={missingInCollectorConfig}
        setOpenPopup={setMissingInCollectorConfig}
        missingInCollectorConfig={missingCollectorComponents}
      />
    </Dialog>
  );
}
