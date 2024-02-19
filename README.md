# gh-file-check

This is a simple tool to check if a file exists in the repositories of the
specified GitHub owners.

```shell
$ deno task run 
Task run deno run -A ./src/main.ts

Usage:   gh-helper
Version: 0.1.0    

Description:

  GitHub helper

Options:

  -h, --help                   - Show this help.                                                                                    
  -V, --version                - Show the version number for this program.                                                          
  -l, --log-level  [logLevel]  - Log level                                  (Default: "CRITICAL", Values: "NOTSET", "DEBUG", "INFO",
                                                                            "WARN", "ERROR", "CRITICAL")                            

Commands:

  file-check  - Check if a file exists on the repos owned by GitHub owner(s)

Environment variables:

  GITHUB_TOKEN  <value>  - GitHub token  (required)
```
