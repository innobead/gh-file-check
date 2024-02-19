import { Command, EnumType, log } from "/deps.ts";

import { fileCheckCmd } from "/src/cmd/mod.ts";

const logLevelType = new EnumType(log.LogLevelNames);

if (import.meta.main) {
  await main();
}

async function main() {
  const mainCmd = new Command()
    .name("gh-helper")
    .version("0.1.0")
    .description("Assist with certain repetitive and verbose GitHub operations")
    .globalType("log_level", logLevelType)
    .option("-l, --log-level [logLevel:log_level]", "Log level", {
      default: log.getLevelName(log.LogLevels.CRITICAL),
      global: true,
    })
    .env("GITHUB_TOKEN=<value:string>", "GitHub token", {
      required: true,
      global: true,
    })
    .globalAction(({ logLevel }) => {
      log.setup({
        handlers: {
          console: new log.ConsoleHandler(logLevel as log.LevelName),
        },
        loggers: {
          default: {
            level: "ERROR",
            handlers: ["console"],
          },
        },
      });
    })
    .action(() => {
      mainCmd.showHelp();
    })
    .command("file-check", fileCheckCmd);

  await mainCmd.parse(Deno.args);

  Deno.exit(0);
}
