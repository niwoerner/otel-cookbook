import { redirect } from "next/navigation";
import RecipeOverviewWizard from "../../components/Recipes/wizard";
import DashboardSidebar from "../../components/sidebar";
import { getRecipeWizardDetails } from "../recipe-gh-data";

export default async function RecipeWizard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const urlParams = await searchParams;
  const recipeName = urlParams.name as string;
  if (!recipeName) {
    redirect("/recipes");
  }
  const recipe = await getRecipeWizardDetails(recipeName);;

  const DashboardContent = (
    <div className="flex flex-col">
      {/* Card header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Recipe Instructions 🧑🏼‍🍳
          </h2>
          <div className="text-md text-muted-foreground mt-1">
            Try out the recipe here.
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col md:flex-row gap-4 mt-2 w-full">
        <div className="flex-1 border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full">
          {recipe ? (
            <RecipeOverviewWizard recipe={recipe} />
          ) : (
            <div>Something went wrong</div> //ToDo: add error handling
          )}
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
