import { EnumType } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { Command, log, Octokit } from "./deps.ts";
import { LevelName } from "https://deno.land/std@0.215.0/log/levels.ts";

const logLevelType = new EnumType([
  "ERROR",
  "DEBUG",
  "INFO",
  "WARN",
  "CRITICAL",
]);

if (import.meta.main) {
  await main();
}

async function main() {
  const { options } = await new Command()
    .name("gh-file-check")
    .version("0.1.0")
    .description("Check if a file exists on the repos owned by GitHub owner(s)")
    .type("log_level", logLevelType)
    .option("-o, --owner <owner:string>", "GitHub owner", {
      collect: true,
      required: true,
    })
    .option("-p, --path <path:string>", "File path to check", {
      required: true,
    })
    .option("-l, --log-level [logLevel:log_level]", "Log level", {
      default: "CRITICAL",
    })
    .env("GITHUB_TOKEN=<value:string>", "GitHub token", {
      required: true,
      global: true,
    })
    .parse(Deno.args);

  log.setup({
    handlers: {
      console: new log.ConsoleHandler(options.logLevel as LevelName),
    },
    loggers: {
      default: {
        level: "ERROR",
        handlers: ["console"],
      },
    },
  });

  const orgs = options.owner as string[];
  const path = options.path as string;
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
    console.info(`No repos of ${orgs.join(",")} have Drone enabled`);
    Deno.exit(1);
  }

  console.info(`Repos of ${orgs.join(",")} with Drone enabled:`);
  for (const repo of repos) {
    console.info(` ${repo.html_url}`);
  }

  Deno.exit(0);
}

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
        log.error(`Failed to request ${repo.html_url}: ${e}`);
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
