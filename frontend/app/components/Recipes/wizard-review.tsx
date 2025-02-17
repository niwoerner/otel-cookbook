"use client";

import { addRecipeReadMeSectionGHRepo } from "@/lib/const";
import { extractRecipeSection, RecipeOverviewWizardProps } from "./wizard";
import StyledMarkdown from "./recipe-markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/card";
import { Button } from "../../../components/button";
import Link from "next/link";

export default function RecipeReviewWizard({
  recipe,
}: RecipeOverviewWizardProps) {
  const preparation = extractRecipeSection(
    recipe.description,
    "## 😋 Executed last time with these versions",
    "''"
  );
  const ghRecipeUrl = `https://github.com/niwoerner/otel-builder-test/discussions/categories/recipes?discussions_q=is%3Aopen+category%3ARecipes+${recipe.name}`;
  return (
    <div className=" ">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Last Execution Details
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-6 prose prose-gray max-w-none">
            <StyledMarkdown content={preparation} />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              Recipe Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-lg text-gray-800 leading-relaxed">
                We hope you liked the taste of this recipe! If you have any <span className="font-semibold">suggestions</span> to make the recipe even tastier, please create an issue in <Link className="text-blue-600 hover:underline" href={ghRecipeUrl}> GitHub</Link>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50 rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-700 mb-3">
                  ⭐ Rate the recipe
                </h3>
                <p className="text-amber-700 mb-4">
                  If you found this recipe helpful, please consider giving the
                  recipe a 👍 or feedback in the GitHub repository.
                </p>
                <Button
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => window.open(ghRecipeUrl, "_blank")}
                >
                  Open in Github
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-800 mb-3">
                  🧑🏼‍🍳 Become a recipe author
                </h3>
                <p className="text-blue-700 mb-4">
                  Have your own configuration recipes? We&apos;d love to see new
                  recipes added by the community - for the community to the
                  Github repo.
                </p>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    window.open(addRecipeReadMeSectionGHRepo, "_blank")
                  }
                >
                  Share Your Recipe
                </Button>
              </div>
            </div>

            <div className="text-center text-gray-600 pt-4">
              <p>
                <span className="font-semibold">Also:</span> Please report
                issues in case something went wrong while cooking the recipe!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
