import { RecipeStatistics } from "@/app/models/recipe.statistics.model";
import { apiClient } from "@/lib/apiClient";
import {
  getBuilderUsageCount,
  getRecipeUsageCount,
  GHRepoPath,
} from "@/lib/const";
import { GithubRepoContributers } from "../models/recipe.gh.response.model";

type usageCountResponse = {
  count: number;
};

export async function getRecipeUsageStatistics() {
  const [contributersCount, usedRecipesCount, usedBuilderCount] =
    await Promise.all([
      apiClient<GithubRepoContributers>(
        `https://api.github.com/repos/${GHRepoPath}/collaborators`
      ),
      apiClient<usageCountResponse>(getRecipeUsageCount),
      apiClient<usageCountResponse>(getBuilderUsageCount),
    ]);

  const RecipeStatistics: RecipeStatistics = {
    totalContributers: contributersCount.length,
    usedRecipes: usedRecipesCount.count,
    generatedBuilderConfigs: usedBuilderCount.count,
  };

  return RecipeStatistics;
}
