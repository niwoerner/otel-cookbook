"use client";

import { OtelCollectorRecipe } from "@/app/models/otel.collector.recipes.model";
import { yaml } from "@codemirror/lang-yaml";
import { Diagnostic, linter } from "@codemirror/lint";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import {
  Check,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clipboard,
} from "lucide-react";
import React, { useState, useCallback } from "react";
import { validateCollectorConfig } from "../Generate/collector-config-validation";
import { extractRecipeSection } from "./wizard";
import StyledMarkdown from "./recipe-markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/card";
import { Button } from "../../../components/button";

type EditorState = {
  name: string;
  code: string;
  lintErrors: Diagnostic[];
};

interface RecipePreparationWizardProps {
  recipe: OtelCollectorRecipe;
}

export default function RecipePreparationWizard({
  recipe,
}: RecipePreparationWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [editorStates, setEditorStates] = useState<EditorState[]>(
    recipe.collectorConfigs.map((cc) => ({
      name: cc.name,
      code: cc.manifest,
      lintErrors: [],
    }))
  );

  const [currentLintErrors, setCurrentLintErrors] = useState<Diagnostic[]>([]);

  const currentCollectorConfig = editorStates[currentIndex];
  const isSingleConfig = recipe.collectorConfigs.length === 1;
  const preparation = extractRecipeSection(
    recipe.description,
    "## 🥣 Preparation",
    "😋 Executed last time with these versions"
  );

  const handleCodeChange = useCallback(
    (code: string) => {
      validateCollectorConfig({
        yaml: code,
        setLintErrors: setCurrentLintErrors,
      });

      setEditorStates((prevStates) =>
        prevStates.map((state, idx) =>
          idx === currentIndex ? { ...state, code } : state
        )
      );
    },
    [currentIndex]
  );

  // Update editor states when lint errors change
  React.useEffect(() => {
    setEditorStates((prevStates) =>
      prevStates.map((state, idx) =>
        idx === currentIndex
          ? { ...state, lintErrors: currentLintErrors }
          : state
      )
    );
  }, [currentLintErrors, currentIndex]);

  // Update current lint errors when switching between editors
  React.useEffect(() => {
    setCurrentLintErrors(currentCollectorConfig.lintErrors);
  }, [currentIndex]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCollectorConfig.code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });
  };

  const navigate = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < recipe.collectorConfigs.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="min-h-[calc(80vh-4rem)] bg-gray-50 p-6 w-full">
      <div className="mx-auto space-y-6 max-w-full">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle>📋 Preparation Instructions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none overflow-auto h-[calc(90vh-16rem)]">
              <StyledMarkdown content={preparation} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle>⚙️ Collector Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(90vh-16rem)]">
              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    {currentCollectorConfig.name}
                  </h4>
                  {!isSingleConfig && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate("prev")}
                        disabled={currentIndex === 0}
                        variant="outline"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => navigate("next")}
                        disabled={
                          currentIndex === recipe.collectorConfigs.length - 1
                        }
                        variant="outline"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground"><span className="font-semibold">Edit</span> and <span className="font-semibold">copy</span> your collector config here!</p>

                <div className="mt-4">
                  <div className="relative rounded-lg border border-gray-500 p-2 bg-gray-800 min-h-[439px]">
                    <CodeMirror
                      value={currentCollectorConfig.code}
                      extensions={[
                        yaml(),
                        linter(() => currentCollectorConfig.lintErrors),
                      ]}
                      onChange={handleCodeChange}
                      theme={dracula}
                      className="rounded-md border-none p-3 text-gray-200 font-mono text-sm bg-transparent"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        className="hover:bg-zinc-700 right-4 bg-transparent "
                        size="icon"
                        onClick={copyToClipboard}
                      >
                        {isCopied ? (
                          <Check color="#4ade80" />
                        ) : (
                          <Clipboard color="#fff" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
