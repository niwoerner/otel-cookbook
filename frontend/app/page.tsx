import { apiClient } from "@/lib/apiClient";
import DashboardSidebar from "./components/sidebar";

import { getOtelcolComponents } from "@/lib/const";
import RunConfigSection from "./components/Generate/collector-run-config";
import CollectorConfigInputSection from "./components/Generate/collector-components-input";
import OtelCollectorComponentsTable from "./components/Generate/collector-components-table";
import {
  OtelCollector,
  OtelComponent,
} from "./models/otel.builder.config.model";
import { ApiError } from "next/dist/server/api-utils";

// Don't prerender for now
export const dynamic = "force-dynamic";

async function getOtelCollectorComponents(): Promise<OtelCollector> {
  try {
    const components = await apiClient<OtelCollector>(getOtelcolComponents, {});
    return components;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `API Error fetching OtelCollectorComponents: ${error.message}`
      );
      throw error;
    } else if (error instanceof Error) {
      console.error(`An unexpected error occurred: ${error.message}`);
      throw error;
    } else {
      console.error("Something went wrong:", error);
      throw new Error("Unknown error occurred");
    }
  }
}

export default async function Dashboard() {
  const data = await getOtelCollectorComponents();
  const components: OtelComponent[] = [
    ...data.Receivers,
    ...data.Exporters,
    ...data.Processors,
    ...data.Connectors,
    ...data.Extensions,
    ...data.Providers,
  ];

  const DashboardContent = (
    <div className="min-h-screen flex flex-col">
      {/* Card header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Generate Builder Config
          </h2>
          <div className="text-md text-muted-foreground mt-1">
            Configure your OpenTelemetry collector distribution here.
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-2">
        <div className="w-full md:w-[35%] border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <CollectorConfigInputSection />
        </div>
        <div className="w-full md:w-[65%] min-w-0 border border-gray-300 rounded-lg p-4 pb-6 shadow-sm hover:shadow-md transition-shadow">
          <OtelCollectorComponentsTable OtelComponents={components} />
        </div>
      </div>
      <div className="rounded-lg mt-6 flex-1 flex w-full border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
        <RunConfigSection />
      </div>
    </div>
  );

  return (
    <>
      <DashboardSidebar DashboardContent={DashboardContent} />
    </>
  );
}
