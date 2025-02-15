import { apiClient } from "@/lib/apiClient";
import { GHRepoPath } from "@/lib/const";
import { format } from "date-fns";
import { load } from "js-yaml";
import {
  GithubRepoFileContents,
  OtelCollectorRecipe,
  OtelCollectorRecipeMetadata,
} from "../models/otel.collector.recipes.model";
import { GithubRepoCommits } from "../models/recipe.gh.response.model";

// ==========================================
// Recipe List Retrieval
// ==========================================

// fetches recipeName, metadata and commit details
export async function getOtelCollectorRecipesList(): Promise<
  OtelCollectorRecipe[]
> {
  const recipes = await apiClient<GithubRepoFileContents[]>(
    `https://api.github.com/repos/${GHRepoPath}/contents?ref=main`
  );

  // We filter out .gihtub actions, root ReadME and root Metadata files here
  const validRecipes = recipes.filter(
    (r) =>
      r.path !== "README.md" &&
      !r.path.includes(".github") &&
      r.path !== "metadata.yaml"
  );

  const recipeDetailsArr: (OtelCollectorRecipe | undefined)[] =
    await Promise.all(
      validRecipes.map((r: GithubRepoFileContents) =>
        getRecipeListDetails(r.path)
      )
    );

  const otelCollectorRecipes = recipeDetailsArr.filter(
    (recipe): recipe is OtelCollectorRecipe => recipe !== undefined
  );

  return otelCollectorRecipes;
}

export async function getRecipeListDetails(
  recipeName: string
): Promise<OtelCollectorRecipe | undefined> {
  const [commitDetails, recipeDirContents] = await Promise.all([
    getCommitInfo(recipeName),
    apiClient<GithubRepoFileContents[]>(
      `https://api.github.com/repos/${GHRepoPath}/contents/${recipeName}?ref=main`
    ),
  ]);

  const metadataExists = recipeDirContents.some((file) => {
    const lowerName = file.name.toLowerCase();
    return lowerName === "metadata.yaml" || lowerName === "metadata.yml";
  });

  if (!metadataExists) {
    console.warn(
      `Skipping recipe: ${recipeName}. Required metadata or README file is missing.`
    );
    return undefined;
  }

  const [collectorConfigs, description, metadata] = await Promise.all([
    getCollectorConfigs(recipeName, recipeDirContents),
    getDescription(recipeName),
    getMetadata(recipeName),
  ]);

  const otelCollectorRecipe: OtelCollectorRecipe = {
    id: Math.random().toString(16).slice(2),
    name: recipeName,
    metadata: metadata,
    author: commitDetails.author,
    lastUpdatedAt: commitDetails.lastUpdatedAt,
    description: description,
    collectorConfigs: collectorConfigs,
    images: getImageUrls(recipeDirContents),
    githubRepoUrl: "",
  };

  return otelCollectorRecipe;
}

export async function getRecipeWizardDetails(recipeName: string): Promise<OtelCollectorRecipe | undefined>{
  const [commitDetails, recipeDirContents] = await Promise.all([
    getCommitInfo(recipeName),
    apiClient<GithubRepoFileContents[]>(
      `https://api.github.com/repos/${GHRepoPath}/contents/${recipeName}?ref=main`
    ),
  ]);

    const [collectorConfigs, description] = await Promise.all([
      getCollectorConfigs(recipeName, recipeDirContents),
      getDescription(recipeName),
    ]);

    const otelCollectorRecipe: OtelCollectorRecipe = {
      id: Math.random().toString(16).slice(2),
      name: recipeName,
      author: commitDetails.author,
      lastUpdatedAt: commitDetails.lastUpdatedAt,
      description: description,
      collectorConfigs: collectorConfigs,
      
      // Below values are not needed in the recipe wizard for now
      metadata: {} as OtelCollectorRecipeMetadata,
      images: [],
      githubRepoUrl: "",
    };

    return otelCollectorRecipe
}

// ==========================================
//  Github Data Retrieval Helper Functions
// ==========================================

type CommitDetails = {
  author: string;
  lastUpdatedAt: string;
};

async function getCommitInfo(filePath: string): Promise<CommitDetails> {
  const commits = await apiClient<GithubRepoCommits>(
    `https://api.github.com/repos/${GHRepoPath}/commits?path=${filePath}&per_page=1`
  );

  if (commits && commits.length > 0) {
    const commit = commits[0];
    const formattedDate = format(
      new Date(commit.commit.author.date),
      "d MMM yyyy HH:mm"
    );

    return {
      author: commit.commit.author.name,
      lastUpdatedAt: formattedDate,
    };
  }

  return {
    author: "Unknown",
    lastUpdatedAt: format(new Date().toISOString(), "d MMM yyyy HH:mm"),
  };
}

async function getMetadata(
  recipeName: string
): Promise<OtelCollectorRecipeMetadata> {
  const recipeMetadataYaml = await apiClient<string>(
    `https://raw.githubusercontent.com/${GHRepoPath}/main/${recipeName}/metadata.yaml`
  );

  const recipeMetadata: OtelCollectorRecipeMetadata = load(
    recipeMetadataYaml
  ) as OtelCollectorRecipeMetadata;

  return recipeMetadata;
}

// recipeDirContents are all files which are in the recipe directory in the gh repo
function getImageUrls(recipeDirContents: GithubRepoFileContents[]): string[] {
  const images: string[] = recipeDirContents
    .filter((file) => file?.name && file.name.endsWith(".png"))
    .map(
      (file) =>
        `https://raw.githubusercontent.com/${GHRepoPath}/main/${file.path}`
    );

  return images;
}

async function getDescription(recipeName: string): Promise<string> {
  return apiClient<string>(
    `https://raw.githubusercontent.com/${GHRepoPath}/main/${recipeName}/README.md`
  );
}

async function getCollectorConfigs(
  recipeName: string,
  recipeDirContents: GithubRepoFileContents[]
): Promise<{ name: string; manifest: string }[]> {
  const configFiles = recipeDirContents.filter(
    (file) => file?.name && file.name.includes("otelcol")
  );

  // Map each config file into a promise resolving to a config object and then wait for all of them to resolve.
  const collectorConfigs = await Promise.all(
    configFiles.map(async (file) => ({
      name: file.name,
      manifest: await apiClient<string>(
        `https://raw.githubusercontent.com/${GHRepoPath}/main/${recipeName}/${file.name}`
      ),
    }))
  );

  return collectorConfigs;
}
