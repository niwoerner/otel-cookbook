'use server';

// Server-only environment variables
// This module is marked with 'use server' to ensure it's only available server-side

export async function getGitHubApiToken(): Promise<string> {
  return process.env.GH_API_TOKEN || '';
}