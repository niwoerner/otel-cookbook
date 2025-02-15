"use client";
import { otelCollectorAtom } from "@/app/atoms/otel.builder.config.atom";
import {
  isNoComponentsSelected,
  RunConfig,
} from "@/app/models/otel.builder.config.model";
import { useAtom } from "jotai";
import { useState } from "react";
import Notification from "../notification-popup";
import CollectorConfigPopup from "./collector-config-popup";

const runConfigs: { id: RunConfig; title: string }[] = [
  { id: "binary", title: "binary" },
  { id: "docker", title: "docker" },
];

const RunConfigSection = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [otelCollector, setOtelCollector] = useAtom(otelCollectorAtom);
  const [runConfig, setRunConfig] = useState<RunConfig>("binary");

  const handleOnStartClick = () => {
    if (
      isNoComponentsSelected(otelCollector) &&
      !otelCollector.BuilderConfig.debugMode
    ) {
      setShowWarning(true);

      setTimeout(() => {
        setShowWarning(false);
      }, 5000);
    } else {
      setOtelCollector((prev) => ({
        ...prev,
        BuilderConfig: {
          ...prev.BuilderConfig,
          runConfig: runConfig,
        },
      }));

      setOpenPopup(true);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className=" w-full max-w-sm space-x-2 ">
        <fieldset className="flex-grow">
          <legend className="text-xl font-semibold text-gray-900">
            Runtime Configuration
          </legend>
          <p className="mt-1 text-md text-gray-600">
            How do you want to run the otel-collector?
          </p>
          <div className="mt-6 space-y-6 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
            {runConfigs.map((runConfig) => (
              <div key={runConfig.id} className="flex items-center">
                <input
                  defaultChecked={runConfig.id === "binary"}
                  id={runConfig.id}
                  name="notification-method"
                  type="radio"
                  className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                  onChange={() => {
                    setRunConfig(runConfig.id);
                  }}
                />
                <label
                  htmlFor={runConfig.id}
                  className="ml-3 block text-md font-medium text-gray-900"
                >
                  {runConfig.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <button
        type="submit"
        className=" rounded-md bg-blue-600 px-3 py-2 text-md font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onClick={handleOnStartClick}
      >
        Generate
      </button>
      <Notification
        type="warning"
        heading="No Components Selected"
        description="Please select at least one component for your collector."
        showNotification={showWarning}
        setShowNotification={setShowWarning}
      />
      <CollectorConfigPopup openPopup={openPopup} setOpenPopup={setOpenPopup} />
    </div>
  );
};
export default RunConfigSection;
