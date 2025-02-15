"use client";
import { revalidateStatistics } from "@/app/recipes/action";
import { apiClient } from "@/lib/apiClient";
import { postOtelcolBuilderConfig, postOtelcolStartConfig } from "@/lib/const";
import { yaml } from "@codemirror/lang-yaml";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { useAtom } from "jotai";
import { Check, Clipboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "../../../components/button";
import { CardContent } from "../../../components/card";
import { ScrollArea } from "../../../components/scroll-area";
import { otelCollectorAtom } from "../../atoms/otel.builder.config.atom";
import {
  isNoComponentsSelected,
  OtelCollector,
} from "../../models/otel.builder.config.model";

// SWR fetcher
async function fetchBuilderConfig(collector: OtelCollector) {
  const response = apiClient<string>(postOtelcolBuilderConfig, {
    method: "POST",
    body: collector,
    serverSide: false,
  });

  await revalidateStatistics();

  return response;
}

async function fetchRunConfig(collector: OtelCollector) {
  const response = apiClient<string>(postOtelcolStartConfig, {
    method: "POST",
    body: collector,
    serverSide: false,
  });

  await revalidateStatistics();
  return response;
}

// We are fetching the configs here
export function useConfigs(shouldFetch: boolean, otelCollector: OtelCollector) {
  const builderConfig = useSWR(
    shouldFetch ? ["builderConfig", otelCollector] : null,
    () => fetchBuilderConfig(otelCollector)
  );

  const runConfig = useSWR(
    shouldFetch ? ["runConfig", otelCollector] : null,
    () => fetchRunConfig(otelCollector)
  );

  useEffect(() => {
    if (builderConfig.error)
      console.error("Builder config error:", builderConfig.error);
    if (runConfig.error) console.error("Runner config error:", runConfig.error);
  }, [builderConfig.error, runConfig.error]);

  return {
    builderConfig: builderConfig.data,
    runConfig: runConfig.data,
  };
}

export const YamlPreview = () => {
  const [builderYaml, setBuilderYaml] = useState<string>("");
  const [runConfigYaml, setRunConfigYaml] = useState<string>("");
  const [otelCollector] = useAtom(otelCollectorAtom);

  if (otelCollector && isNoComponentsSelected(otelCollector)) {
    console.warn("Otel collector is empty. Redirecting to Generate page.");
    redirect("/");
  }

  // Only fetch if we have a valid collector (not null/undefined)
  const shouldFetch = otelCollector && !isNoComponentsSelected(otelCollector);

  const { builderConfig, runConfig } = useConfigs(shouldFetch, otelCollector);

  useEffect(() => {
    if (builderConfig) setBuilderYaml(builderConfig);
    if (runConfig) setRunConfigYaml(runConfig);
  }, [builderConfig, runConfig]);

  const [builderCopied, setBuilderCopied] = useState(false);
  const [runtimeCopied, setRuntimeCopied] = useState(false);

  const copyContent = (type: string) => {
    if (type == "builder") {
      navigator.clipboard.writeText(builderYaml).then(() => {
        setBuilderCopied(true);
        setTimeout(() => setBuilderCopied(false), 1500);
      });
    }

    if (type == "runtime") {
      navigator.clipboard.writeText(runConfigYaml).then(() => {
        setRuntimeCopied(true);
        setTimeout(() => setRuntimeCopied(false), 1500);
      });
    }

    if (type === "download") {
      const blob = new Blob([runConfigYaml], { type: "text/x-sh" });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "build-and-run-otel-collector.sh";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
    }
  };

  return (
    <div className="w-full h-full mx-auto min-h-screen">
      {/* Card header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Build and Run Config
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-md font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Back
            </button>
          </Link>

          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-md font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={() => copyContent("download")}
          >
            Download
          </button>
        </div>
      </div>
      {/* Builder config card content */}
      <div className="mt-4 border-gray-300 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h1 className="mt-2 mb-2 px-2 text-l font-semibold">Builder Config</h1>
        <div className="px-2 text-sm text-muted-foreground ">
          Use this yaml file to build your OpenTelemetry collector.
        </div>
        <Suspense fallback={<div>Generating the builder config...</div>}>
          <CardContent className="p-0 h-full w-full">
            <ScrollArea className="max-h-[60rem] overflow-auto p-4 ">
              <div className="rounded-lg border border-gray-500 p-2 bg-gray-800">
                <CodeMirror
                  value={builderYaml}
                  extensions={[yaml()]}
                  className="rounded-md border-none p-3 text-gray-200 font-mono text-sm bg-transparent "
                  theme={dracula}
                  readOnly
                  editable={false}
                />
              </div>
              <div className="absolute top-8 right-6 ">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-zinc-700 right-4  bg-transparent"
                  onClick={() => copyContent("builder")}
                >
                  {builderCopied ? (
                    <Check color="#4ade80" />
                  ) : (
                    <Clipboard color="#fff" />
                  )}
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Suspense>
      </div>

      {/* Runtime Config Card content */}
      {/* Card content */}
      <div className="mt-4 border-gray-300 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h1 className="mt-2 mb-2 px-2 text-l font-semibold">Run Config</h1>
        <div className="px-2 text-sm text-muted-foreground ">
          Run this bash script to start your OpenTelemetry collector.{" "}
          <span className="font-semibold">Note:</span> The script was{" "}
          <span className="font-semibold">only tested</span> on MacOS and Linux
          (Ubuntu).
        </div>
        <Suspense fallback={<div>Generating the builder config...</div>}>
          <CardContent className="p-0 h-full w-full">
            <ScrollArea className="max-h-[60rem] overflow-auto p-4 ">
              <div className="rounded-lg border border-gray-500 p-2 bg-gray-800">
                <CodeMirror
                  value={runConfigYaml}
                  extensions={[basicSetup, StreamLanguage.define(shell)]}
                  className="rounded-md border-none p-3 text-gray-200 font-mono text-sm bg-transparent"
                  theme={dracula}
                  readOnly
                  editable={false}
                />
              </div>
              <div className="absolute top-8 right-6 ">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-zinc-700 right-4 bg-transparent "
                  onClick={() => copyContent("runtime")}
                >
                  {runtimeCopied ? (
                    <Check color="#4ade80" />
                  ) : (
                    <Clipboard color="#fff" />
                  )}
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Suspense>
      </div>
    </div>
  );
};
