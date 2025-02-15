import { extractRecipeSection, RecipeOverviewWizardProps } from "./wizard";
import StyledMarkdown from "./recipe-markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/card";

export default function RecipeIngredientsWizard({
  recipe,
}: RecipeOverviewWizardProps) {
  const ingredients = extractRecipeSection(
    recipe.description,
    "",
    "## 🥣 Preparation"
  );
  return (
    <div className="min-h-[calc(80vh-4rem)] bg-gray-50 p-6 w-full">
      <div className="mx-auto space-y-6 max-w-full">
        <Card className="bg-white shadow-lg h-fit w-full">
          <CardHeader className="border-b border-gray-100 h-22 sm:h-22 md:h-22">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              🧄 Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent
            className="prose prose-gray max-w-none overflow-auto mt-6 h-[calc(90vh-16rem)] sm:h-[calc(90vh-16rem)] md:h-[calc(90vh-16rem)] 
              prose-sm sm:prose-base md:prose-lg"
          >
            <StyledMarkdown content={ingredients} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
