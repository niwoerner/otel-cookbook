import { Suspense } from "react";
import { OtelCollectorRecipeTable } from "../components/Recipes/table";
import DashboardSidebar from "../components/sidebar";
import {
  getOtelCollectorRecipesList,
} from "./recipe-gh-data";
import { getRecipeUsageStatistics } from "./recipe-statistics-data";

export default async function Recipes() {
  // Fetches required recipe data on page load
  const [recipes, recipeStatistics] = await Promise.all([
    getOtelCollectorRecipesList(),
    getRecipeUsageStatistics(),
  ]);

  const DashboardContent = (
    <div className="flex flex-col">
      {/* Card header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Recipe Collection
          </h2>
          <div className="text-md text-muted-foreground mt-1">
            Collection of commonly used OpenTelemetry collector configurations. From the
            community - for the community.
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col md:flex-row gap-4 mt-2 w-full">
        <div className="flex-1 border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full">
          <Suspense fallback={<h1>loading....</h1>}>
            <OtelCollectorRecipeTable
              OtelCollectorRecipes={recipes}
              RecipeStatistics={recipeStatistics}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DashboardSidebar DashboardContent={DashboardContent} />
    </>
  );
}
