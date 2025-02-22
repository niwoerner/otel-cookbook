"use client";
import { otelCollectorAtom } from "@/app/atoms/otel.builder.config.atom";
import { Dropdown } from "@/components/dropdown";
import { defaultCollectorConfig } from "@/lib/const";
import EllipsisHorizontalIcon from "@heroicons/react/24/outline/EllipsisHorizontalIcon";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect } from "react";
import {
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "../../../components/dropdown";
import { Field, Label } from "../../../components/fieldset";
import { Input } from "../../../components/input";

export default function CollectorConfigInputSection() {
  const [builderConfig, setBuilderConfig] = useAtom(otelCollectorAtom);

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
    <div className="w-full gap-4 grid flex-none">
      <div className="border-b border-gray-100 h-22 sm:h-22 md:h-22 min-w-ful overflow-hidden">
        <h1 className="mb-2 text-xl font-semibold truncate">
          Collector Config
        </h1>
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
      <div className="border-b border-gray-100 h-22 sm:h-22 md:h-22 min-w-full mt-8 overflow-hidden">
        <h1 className="mb-2 text-xl font-semibold truncate">
          Selected Components
        </h1>
      </div>
      <div className="space-y-6 overflow-auto max-h-[500px] px-1 sm:px-2">
        {(() => {
          const componentSections = [
            { title: "Receivers", items: builderConfig.Receivers },
            { title: "Processors", items: builderConfig.Processors },
            { title: "Exporters", items: builderConfig.Exporters },
            { title: "Extensions", items: builderConfig.Extensions },
            { title: "Providers", items: builderConfig.Providers },
            { title: "Connectors", items: builderConfig.Connectors },
          ];
          
          const componentSelection = componentSections.filter(({ items }) => items.length > 0);
          
          if (componentSelection.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-md text-gray-500">
                  Selected components will appear here
                </p>
              </div>
            );
          }

          return componentSelection.map(({ title, items }) => (
            <div
              key={title}
              className="bg-white rounded-lg shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900 p-4 border-b border-gray-100">
                {title}:
              </h3>
              <ul role="list" className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={item.name}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {item.version}
                        </p>
                      </div>

                      <Dropdown>
                        <DropdownButton
                          plain
                          aria-label="More options"
                          className="hover:bg-gray-100 p-2 rounded-full"
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
                        </DropdownButton>
                        <DropdownMenu>
                          <DropdownItem
                            onClick={() =>
                              navigator.clipboard.writeText(item.moduleUrl)
                            }
                            className="flex items-center gap-2"
                          >
                            <span>Copy component URL</span>
                          </DropdownItem>
                          <DropdownItem
                            target="_blank"
                            href={item.githubUrl}
                            className="flex items-center gap-2"
                          >
                            <span>View component</span>
                          </DropdownItem>
                          <DropdownItem
                            target="_blank"
                            href={item.githubUrl + "/README.md"}
                            className="flex items-center gap-2"
                          >
                            <span>View docs</span>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
