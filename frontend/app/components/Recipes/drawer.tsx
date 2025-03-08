"use client";

import { OtelCollectorRecipe } from "@/app/models/otel.collector.recipes.model";
import { revalidateStatistics } from "@/app/recipes/action";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Skeleton } from "@/components/skeleton";
import { apiClient } from "@/lib/apiClient";
import { postRecipeUsage } from "@/lib/const";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import StyledMarkdown from "./recipe-markdown";

type RecipeDetailsDrawerProps = {
  recipeDetails: OtelCollectorRecipe;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
};

type UsedRecipe = {
  name: string;
};

type RecipeUsageResponse = {
  status: string;
};

export default function RecipeDetailsDrawer({
  recipeDetails,
  currentImageIndex,
  setCurrentImageIndex,
  showDrawer,
  setShowDrawer,
}: RecipeDetailsDrawerProps) {
  const router = useRouter();

  const handleUseRecipeClick = async () => {
    try {
      const usedRecipe: UsedRecipe = { name: recipeDetails.name };

      apiClient<RecipeUsageResponse>(postRecipeUsage, {
        method: "POST",
        body: { usedRecipe },
        serverSide: false,
      });

      revalidateStatistics();
    } catch (error) {
      console.error("Error adding recipe usage event to databse", error);
    }
    router.push("/recipes/wizard?name=" + recipeDetails.name);
  };

  //Image Navigation Buttons
  const isSingleImage = recipeDetails.images.length === 1;

  const handleNextClick = () => {
    if (currentImageIndex < recipeDetails.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  const handlePreviousClick = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentImageIndex]);

  return (
    <Dialog open={showDrawer} onClose={setShowDrawer} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75  transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-[60rem] transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <TransitionChild>
                <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 duration-500 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    onClick={() => setShowDrawer(false)}
                    className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </TransitionChild>
              <div className="h-full overflow-y-auto bg-white p-8">
                <div className="space-y-6 pb-16">
                  <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      🍴 Cooking Instructions 🍴
                    </h1>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        className="flex-1 sm:flex-none rounded-md bg-blue-600 px-4 sm:px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-w-[120px]"
                        onClick={() => handleUseRecipeClick()}
                      >
                        Use Recipe
                      </button>
                      <button
                        type="button"
                        className="flex-1 sm:flex-none rounded-md bg-white px-4 sm:px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:min-w-[120px]"
                      >
                        <a href={recipeDetails.githubRepoUrl} target="_blank">
                          View in GitHub
                        </a>
                      </button>
                    </div>
                  </div>
                  <div>
                    {recipeDetails.images &&
                      recipeDetails.images.length > 0 && (
                        <div>
                          <div className="relative">
                            {!isImageLoaded && (
                              <Skeleton className="flex items-center justify-center aspect-[10/7] w-full rounded-lg object-cover">
                                <LoadingSpinner size={32} />
                              </Skeleton>
                            )}
                            <Image
                              src={recipeDetails.images[currentImageIndex]}
                              className={`block aspect-[10/7] w-full rounded-lg object-cover transition-opacity duration-500 ${
                                isImageLoaded ? "opacity-100" : "hidden"
                              }`}
                              alt="example usage of the recipe"
                              width={999}
                              height={999}
                              quality={100}
                              priority
                              onLoadingComplete={() => setIsImageLoaded(true)}
                            />
                          </div>
                          {!isSingleImage && (
                            <div className="flex justify-between sm:justify-end mt-4">
                              {/* Left Button */}
                              <button
                                onClick={handlePreviousClick}
                                disabled={currentImageIndex === 0}
                                className={`relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 ${
                                  currentImageIndex === 0
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                              >
                                <ChevronLeftIcon className="w-5 h-5" />
                              </button>

                              {/* Right Button */}
                              <button
                                onClick={handleNextClick}
                                disabled={
                                  currentImageIndex ===
                                  recipeDetails.images.length - 1
                                }
                                className={`relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 ${
                                  currentImageIndex ===
                                  recipeDetails.images.length - 1
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                              >
                                <ChevronRightIcon className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm  text-gray-500">
                        <StyledMarkdown content={recipeDetails.description} />
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <button
                      type="button"
                      className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      onClick={() => handleUseRecipeClick()}
                    >
                      Use Recipe
                    </button>
                    <button
                      type="button"
                      className="ml-3 flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <a href={recipeDetails.githubRepoUrl} target="_blank">
                        View in GitHub
                      </a>
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
