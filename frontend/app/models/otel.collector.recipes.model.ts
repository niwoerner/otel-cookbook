export type OtelCollectorRecipe = {
    id: string; 
    name: string; 
    description: string;
    collectorConfigs: CollectorConfig[];
    metadata: OtelCollectorRecipeMetadata;  
    images: string[]; //List to github image urls to download and show as an example 
    author: string; 
    lastUpdatedAt: string;
    githubRepoUrl: string; 
}

export type CollectorConfig = {
  name: string; 
  manifest: string
}
export type RecipeType = 
  | "k8s" 
  | "ottl" 
  | "cicd" 
  | "sampling" 
  | "observability" 
  | "miscellaneous";

export type FieldType = "string" | "string[]" | "number" | "boolean";

export type OtelCollectorRecipeMetadata = {
  type: RecipeType;
  recipe_inputs: {
    enabled?: boolean;
    fields: RecipeField[];
  };
}

export type RecipeField = {
    path: string;
    name: string; 
    type?: FieldType; // type will be added as tag in the recipe list
    default?: string | string[] | number | boolean;
    description?: string;
    allowed_values?: string[];
  }

export type GithubRepoFileContents = {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string; 
    type: string; 
    links: Links;
}

type Links = {
    self: string;
    git: string;
    html: string;
  }

