import {
  GH_API_TOKEN,
  NEXT_PUBLIC_BACKEND_URL,
  SERVER_SIDE_BACKEND_URL,
} from "./const";

type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  reqContentType?: "json" | "yaml" | "png";
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  body?: any;
  headers?: Record<string, string>;
  retries?: number;
  timeout?: number;
  serverSide?: boolean;
};

type GithubApiCache<T> = {
  data: T;
  expiration: number;
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
const cache: Record<string, GithubApiCache<any>> = {};
const cacheDuration = Date.now() + 15 * 60 * 1000; //15minutes

export const apiClient = async <T>(
  endpoint: string,
  {
    method = "GET",
    body,
    headers = {},
    retries = 3,
    timeout = 5000,
    reqContentType = "json",
    serverSide = true,
  }: RequestConfig = {}
): Promise<T> => {
  const cacheKey = `${method}-${endpoint}-${JSON.stringify(body || "")}`;

  // Check if cache hit
  if (cache[cacheKey] && cache[cacheKey].expiration > Date.now()) {
    console.log(`Cache hit for ${cacheKey}`);
    return cache[cacheKey].data as T;
  }

  const makeRequest = async (attempt: number): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let url;
      if (!serverSide) {
        url = endpoint.startsWith("https://")
          ? endpoint
          : `${NEXT_PUBLIC_BACKEND_URL}${endpoint}`;
      } else {
        url = endpoint.startsWith("https://")
          ? endpoint
          : `${SERVER_SIDE_BACKEND_URL}${endpoint}`;
      }

      console.log("sending request to url: ", url);

      // Add GitHub token if the request is to the GitHub API
      const isGitHubApi =
        url.includes("api.github.com") ||
        url.includes("raw.githubusercontent.com");
      if (isGitHubApi && GH_API_TOKEN) {
        headers.Authorization = `Bearer ${GH_API_TOKEN}`;
      }

      let contentTypeHeader: string;

      if (reqContentType === "png") {
        contentTypeHeader = "image/png";
      } else if (reqContentType === "yaml") {
        contentTypeHeader = "application/x-yaml";
      } else {
        contentTypeHeader = "application/json";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": contentTypeHeader,
          ...headers,
        },
        body: body
          ? contentTypeHeader === "application/json"
            ? JSON.stringify(body)
            : body // Assume YAML is passed as a string
          : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({
            message: `Unknown error when sending request to: ${endpoint}`,
          }));
        throw new Error(
          error.message ||
            `HTTP Error: ${response.status} when sending request to: ${endpoint}`
        );
      }

      const responseContentType = response.headers.get("Content-Type") || "";

      let result: T;
      if (responseContentType.includes("application/json")) {
        result = await response.json();
      } else if (
        responseContentType.includes("application/x-yaml") ||
        responseContentType.includes("text/plain")
      ) {
        result = (await response.text()) as T;
      } else if (reqContentType.includes("png")) {
        result = (await response.arrayBuffer()) as T;
      } else {
        result = await response.json();
      }

      // Store the cache
      if (isGitHubApi) {
        cache[cacheKey] = { data: result, expiration: cacheDuration };
        console.log(`Cached response for ${cacheKey}`);
      }

      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (
        attempt < retries &&
        (error.name === "AbortError" || error.message.includes("NetworkError"))
      ) {
        console.warn(
          `Retrying request to ${endpoint} (Attempt ${
            attempt + 1
          } of ${retries})`
        );
        return makeRequest(attempt + 1);
      }

      throw new Error(
        error.message ||
          "Failed to fetch data when sending request to: ${endpoint}"
      );
    }
  };

  return makeRequest(0);
};
