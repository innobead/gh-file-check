import { Octokit } from "https://esm.sh/octokit?dts";
import * as log from "https://deno.land/std@0.215.0/log/mod.ts";
async function findRepos(org: string, octokit: Octokit) {
  const repos = [];

  const { data } = await octokit.rest.repos.listForOrg({ org });
  for (const repo of data) {
    try {
      await octokit.request(
        "HEAD /repos/{owner}/{repo}/contents/{path}",
        {
          owner: org,
          repo: repo.name,
          path: ".drone.yml",
        },
      );

      repos.push(repo);
    } catch (e) {
      if (e.status == 404) {
        log.info(`repo: ${repo.url}, drone disabled`);
      } else {
        log.error(`Error: ${e} when getting ${repo.url}`);
      }
    }
  }

  return repos;
}

if (import.meta.main) {
  log.setup({
    handlers: {
      console: new log.ConsoleHandler("ERROR"),
    },
    loggers: {
      default: {
        level: "ERROR",
        handlers: ["console"],
      },
    },
  });

  if (Deno.args.length == 0) {
    console.error("GitHub owner(s) are not provided as arguments");
    Deno.exit(1);
  }

  const orgs = Deno.args;
  const GITHUB_TOKEN = "GITHUB_TOKEN";

  const gh_token = Deno.env.get(GITHUB_TOKEN);
  if (gh_token === undefined) {
    console.error(`${GITHUB_TOKEN} environment variable is not provided`);
    Deno.exit(1);
  }

  const octokit = new Octokit({ auth: gh_token });
  const reposWithDrone = [];

  for (const org of orgs) {
    reposWithDrone.push(...await findRepos(org, octokit));
  }

  if (reposWithDrone.length == 0) {
    console.info(`No repos of ${orgs.join(",")} have Drone enabled`);
    Deno.exit(1);
  }

  console.info(`Repos of ${orgs.join(",")} with Drone enabled:`);
  for (const repo of reposWithDrone) {
    console.info(` ${repo.html_url}`);
  }

  Deno.exit(0);
}
