"use client";
import { otelCollectorAtom } from "@/app/atoms/otel.builder.config.atom";
import { defaultCollectorConfig } from "@/lib/const";
import { useSetAtom } from "jotai";
import { Field, Label } from "../../../components/fieldset";
import { Input } from "../../../components/input";
import { useResetAtom } from "jotai/utils";
import { useEffect } from "react";

export default function CollectorConfigInputSection() {
  const setBuilderConfig = useSetAtom(otelCollectorAtom);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBuilderConfig((prev) => ({
      ...prev,
      BuilderConfig: {
        ...prev.BuilderConfig,
        [name]: value,
      },
    }));
  };

  const resetOtelCollector = useResetAtom(otelCollectorAtom);

  // We need to reset the state of the OtelCollector once on page load to avoid multiple selections if the user generates something multiple times and switches between generate and the preview page
  useEffect(() => {
    resetOtelCollector();
  }, [resetOtelCollector]);

  return (
    <div className="w-full  gap-4 grid flex-none">
      <div className="border-b border-gray-100 h-22 sm:h-22 md:h-22 min-w-full">
        <h1 className="mb-2 text-xl font-semibold ">Collector Config</h1>
      </div>
      <Field>
        <Label>Name</Label>
        <Input
          name="collectorName"
          placeholder={defaultCollectorConfig.collectorName}
          className="mt-1"
          onChange={handleInputChange}
        />
      </Field>
      <Field>
        <Label>Description</Label>
        <Input
          name="description"
          placeholder={defaultCollectorConfig.description}
          className="mt-1"
          onChange={handleInputChange}
        />
      </Field>

      <Field>
        <Label>Output Path</Label>
        <Input
          name="outputPath"
          placeholder={defaultCollectorConfig.outputPath}
          className="mt-1"
          onChange={handleInputChange}
        />
      </Field>
    </div>
  );
}
