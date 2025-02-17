"use client";
import { OtelCollectorRecipe } from "@/app/models/otel.collector.recipes.model";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import RecipeIngredientsWizard from "./wizard-ingredients";
import RecipePreparationWizard from "./wizard-preparation";
import RecipeTastingWizard from "./wizard-review";

export type RecipeOverviewWizardProps = {
  recipe: OtelCollectorRecipe;
};

const recipeInstructionsOrder = [
  { id: "01", name: "Ingredients 🧄", href: "#", status: "complete" },
  { id: "02", name: "Preparation 🥣", href: "#", status: "current" },
  { id: "03", name: "Review 😋", href: "#", status: "upcoming" },
];

export default function RecipeOverviewWizard({
  recipe,
}: RecipeOverviewWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const updatedSteps = recipeInstructionsOrder.map((step, index) => ({
    ...step,
    status:
      index === currentStepIndex
        ? "current"
        : index < currentStepIndex
        ? "complete"
        : "upcoming",
  }));

  const handleNext = () => {
    if (currentStepIndex < recipeInstructionsOrder.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <RecipeIngredientsWizard recipe={recipe} />;
      case 1:
        return <RecipePreparationWizard recipe={recipe} />;
      case 2:
        return <RecipeTastingWizard recipe={recipe} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <nav aria-label="Progress">
        <ol
          role="list"
          className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
        >
          {updatedSteps.map((step, stepIdx) => (
            <li key={step.name} className="relative md:flex md:flex-1">
              {step.status === "complete" ? (
                <a
                  className="group flex w-full items-center cursor-pointer"
                  onClick={() => setCurrentStepIndex(stepIdx)}
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-800">
                      <CheckIcon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </a>
              ) : step.status === "current" ? (
                <a
                  aria-current="step"
                  className="flex items-center px-6 py-4 text-sm font-medium cursor-pointer"
                  onClick={() => setCurrentStepIndex(stepIdx)}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-600">
                    <span className="text-blue-600">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-blue-600">
                    {step.name}
                  </span>
                </a>
              ) : (
                <a
                  className="group flex items-center cursor-pointer"
                  onClick={() => setCurrentStepIndex(stepIdx)}
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                      <span className="text-gray-500 group-hover:text-gray-900">
                        {step.id}
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </a>
              )}

              {stepIdx !== updatedSteps.length - 1 ? (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-0 hidden h-full w-5 md:block"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 22 80"
                      preserveAspectRatio="none"
                      className="size-full text-gray-300"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        stroke="currentcolor"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-6">{renderCurrentStep()}</div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className={`flex items-center px-4 py-2 border rounded-md ${
            currentStepIndex === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-blue-600 hover:bg-blue-50 border-blue-600"
          }`}
        >
          <ChevronLeftIcon className="size-5 mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === recipeInstructionsOrder.length - 1}
          className={`flex items-center px-4 py-2 border rounded-md ${
            currentStepIndex === recipeInstructionsOrder.length - 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-blue-600 hover:bg-blue-50 border-blue-600"
          }`}
        >
          Next
          <ChevronRightIcon className="size-5 ml-2" />
        </button>
      </div>
    </div>
  );
}

export function extractRecipeSection(
  recipe: string,
  startSection: string,
  endSection: string
): string {
  const startIndex = recipe.indexOf(startSection);

  if (startIndex === -1) {
    return "";
  }

  const contentStartIndex = startIndex; // Include the startSection
  const stopIndex = recipe.indexOf(endSection, contentStartIndex);
  const endIndex = stopIndex !== -1 ? stopIndex : recipe.length;

  return recipe.slice(contentStartIndex, endIndex).trim();
}
