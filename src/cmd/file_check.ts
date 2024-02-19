import { Command, log, Octokit, yaml } from "/deps.ts";

export default new Command()
  .description("Check if a file exists on the repos owned by GitHub owner(s)")
  .option("-o, --owner <owner:string>", "GitHub owner", {
    collect: true,
    required: true,
  })
  .option("-p, --path <path:string>", "File path to check", {
    required: true,
  })
  .action(async (options) => {
    const orgs = options.owner as string[];
    const path = options.path as string;
    // @ts-ignore: to access `githubToken` global option
    const octokit = new Octokit({ auth: options.githubToken });

    const promises = [];
    for (const org of orgs) {
      promises.push(fineReposHavingPath(octokit, path, org));
    }

    const repos = [];
    for (const promise of promises) {
      repos.push(...await promise);
    }

    if (repos.length == 0) {
      console.info(`No repos of ${orgs.join(",")} found with Drone enabled`);
      Deno.exit(1);
    }

    console.info(`Found repos of ${orgs.join(",")} with Drone enabled`);
    const output: { repos: string[] } = { repos: [] };
    repos.forEach((r) => output.repos.push(r.html_url));
    console.log(yaml.stringify(output));
  });

async function fineReposHavingPath(
  octokit: Octokit,
  path: string,
  org: string,
) {
  const requests = [];
  const { data } = await octokit.rest.repos.listForOrg({ org });
  for (const repo of data) {
    requests.push((async (repo) => {
      try {
        await octokit.request("HEAD /repos/{owner}/{repo}/contents/{path}", {
          owner: org,
          repo: repo.name,
          path,
        });
      } catch (e) {
        log.warn(`Failed to request ${repo.html_url}: ${e}`);
      }
    })(repo));
  }

  const repos: any[] = [];
  await Promise.allSettled(requests).then((result) => {
    result.forEach((result, index) => {
      const repo = data.at(index);
      if (result.status == "fulfilled") {
        repos.push(repo);
      }
    });
  });

  return repos;
}
