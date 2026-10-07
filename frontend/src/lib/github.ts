



const GITHUB_API = "https://api.github.com";

const OWNER = process.env.GITHUB_OWNER as string;
const REPO = process.env.GITHUB_REPO as string;
const TOKEN = process.env.GITHUB_TOKEN as string;

if (!OWNER || !REPO || !TOKEN) {
  
  console.warn(
    "[github.ts] Missing GITHUB_OWNER, GITHUB_REPO, or GITHUB_TOKEN env vars."
  );
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};const REVALIDATE_SECONDS = 60 * 60;

export type Contributor = {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
};

export type ContributorWithPRs = Contributor & {
  prsMerged: number;
};

export type RepoStats = {
  totalContributors: number;
  pullRequestsOpened: number;
  pullRequestsMerged: number;
};

async function githubFetch(path: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub API error ${res.status} for ${path}: ${body.slice(0, 300)}`
    );
  }

  return res.json();
}


export async function getContributors(): Promise<Contributor[]> {
  const results: Contributor[] = [];
  let page = 1;

  while (true) {
    const data = await githubFetch(
      `/repos/${OWNER}/${REPO}/contributors?per_page=100&page=${page}&anon=false`
    );

    if (!Array.isArray(data) || data.length === 0) break;

    for (const c of data) {
      if (!c.login) continue;
      results.push({
        login: c.login,
        avatarUrl: c.avatar_url,
        profileUrl: c.html_url,
        contributions: c.contributions,
      });
    }

    if (data.length < 100) break;
    page += 1;
    if (page > 10) break;
  }

  return results;
}


export async function getPullRequestStats(): Promise<RepoStats> {
  const [openedRes, mergedRes] = await Promise.all([
    githubFetch(
      `/search/issues?q=repo:${OWNER}/${REPO}+type:pr&per_page=1`
    ),
    githubFetch(
      `/search/issues?q=repo:${OWNER}/${REPO}+type:pr+is:merged&per_page=1`
    ),
  ]);

  const contributors = await getContributors();

  return {
    totalContributors: contributors.length,
    pullRequestsOpened: openedRes.total_count ?? 0,
    pullRequestsMerged: mergedRes.total_count ?? 0,
  };
}


export async function getTopContributorsByMergedPRs(
  limit = 10
): Promise<ContributorWithPRs[]> {
  const MAX_PAGES = 5;
  const tally = new Map<string, { avatarUrl: string; profileUrl: string; count: number }>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await githubFetch(
      `/repos/${OWNER}/${REPO}/pulls?state=closed&per_page=100&page=${page}&sort=updated&direction=desc`
    );

    if (!Array.isArray(data) || data.length === 0) break;

    for (const pr of data) {
      if (!pr.merged_at || !pr.user?.login) continue;
      const key = pr.user.login;
      const existing = tally.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tally.set(key, {
          avatarUrl: pr.user.avatar_url,
          profileUrl: pr.user.html_url,
          count: 1,
        });
      }
    }

    if (data.length < 100) break;
  }

  return Array.from(tally.entries())
    .map(([login, v]) => ({
      login,
      avatarUrl: v.avatarUrl,
      profileUrl: v.profileUrl,
      contributions: 0,
      prsMerged: v.count,
    }))
    .sort((a, b) => b.prsMerged - a.prsMerged)
    .slice(0, limit);
}