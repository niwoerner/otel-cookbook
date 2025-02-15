// Types for the contributers of the Recipe collection repo 
export type GitHubUserPermissions = {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  
  export type GitHubUser = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    user_view_type: string;
    site_admin: boolean;
    permissions: GitHubUserPermissions;
    role_name: string;
  };
  
  export type GithubRepoContributers = GitHubUser[];
  
// Types for the commits of the Recipe collection repo 

  export interface GitCommitAuthor {
    name: string;
    email: string;
    date: string;
  }
  
  export interface GitCommitTree {
    sha: string;
    url: string;
  }
  
  export interface GitCommitVerification {
    verified: boolean;
    reason: string;
    signature: string | null;
    payload: string | null;
  }
  
  export interface GitCommitDetail {
    author: GitCommitAuthor;
    committer: GitCommitAuthor;
    message: string;
    tree: GitCommitTree;
    url: string;
    comment_count: number;
    verification: GitCommitVerification;
  }
  
  export interface GitCommitParent {
    sha: string;
    url: string;
    html_url: string;
  }
  
  export interface GitCommit {
    sha: string;
    node_id: string;
    commit: GitCommitDetail;
    url: string;
    html_url: string;
    comments_url: string;
    author: GitHubUser | null;     // In GitHub's API, these can be null if the commit author is not a GitHub user
    committer: GitHubUser | null;  
    parents: GitCommitParent[];
  }
  
  export type GithubRepoCommits = GitCommit[];
  