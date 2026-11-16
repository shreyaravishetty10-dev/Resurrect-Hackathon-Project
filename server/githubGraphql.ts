/**
 * GitHub GraphQL API Client for ZK-GitProof
 * Queries private repository statistics, merged PRs, languages,
 * and extracts Anti-Gaming metrics (collaborator counts and PR diff line changes).
 */

export interface RepoMetrics {
  name: string;
  isPrivate: boolean;
  primaryLanguage: string;
  mergedPRCount: number;
  collaboratorsCount: number;
  totalLinesChanged: number;
  antiGamingPassed: boolean;
  timeframe: string;
}

export const GITHUB_PRIVATE_REPOS_QUERY = `
query GetPrivateRepoStats($first: Int = 20) {
  viewer {
    login
    name
    repositories(first: $first, privacy: PRIVATE, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        name
        nameWithOwner
        isPrivate
        primaryLanguage {
          name
        }
        collaborators {
          totalCount
        }
        pullRequests(states: MERGED, first: 50) {
          totalCount
          nodes {
            title
            mergedAt
            additions
            deletions
          }
        }
        createdAt
        updatedAt
      }
    }
  }
}
`;

export const GITHUB_ENTERPRISE_CONTRIBUTIONS_QUERY = `
query GetEnterpriseContributions($from: DateTime, $to: DateTime) {
  viewer {
    login
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      restrictedContributionsCount
      pullRequestContributions(first: 50) {
        totalCount
      }
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

export async function fetchPrivateRepos(accessToken: string): Promise<RepoMetrics[]> {
  const endpoint = process.env.GITHUB_GRAPHQL_ENDPOINT || "https://api.github.com/graphql";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "ZK-GitProof-Verification-Engine",
    },
    body: JSON.stringify({ query: GITHUB_PRIVATE_REPOS_QUERY }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL API error: ${response.statusText}`);
  }

  const data: any = await response.json();
  const repoNodes = data?.data?.viewer?.repositories?.nodes || [];

  return repoNodes.map((repo: any) => {
    const prs = repo.pullRequests?.nodes || [];
    let linesChanged = 0;
    prs.forEach((pr: any) => {
      linesChanged += (pr.additions || 0) + (pr.deletions || 0);
    });

    const collaboratorsCount = repo.collaborators?.totalCount || 1;
    const mergedPRCount = repo.pullRequests?.totalCount || 0;

    // Phase 2: Anti-Gaming Check (Multi-contributor >= 2 & lines changed >= 500)
    const antiGamingPassed = collaboratorsCount >= 2 && linesChanged >= 500;

    return {
      name: repo.nameWithOwner || repo.name,
      isPrivate: repo.isPrivate,
      primaryLanguage: repo.primaryLanguage?.name || "Code",
      mergedPRCount,
      collaboratorsCount,
      totalLinesChanged: linesChanged,
      antiGamingPassed,
      timeframe: "Last 12 Months",
    };
  });
}
