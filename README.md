# gh-file-check

This is a simple tool to check if a file exists in the repositories of the
specified GitHub owners.

```shell
># deno run -A main.ts -h

Usage:   gh-file-check --owner <owner> --path <path>
Version: 0.1.0                                      

Description:

  Check if a file exists on the repos owned by GitHub owner(s)

Options:

  -h, --help                   - Show this help.                                                                                   
  -V, --version                - Show the version number for this program.                                                         
  -o, --owner      <owner>     - GitHub owner                               (required)                                             
  -p, --path       <path>      - File path to check                         (required)                                             
  -l, --log-level  [logLevel]  - Log level                                  (Default: "CRITICAL", Values: "ERROR", "DEBUG", "INFO",
                                                                            "WARN", "CRITICAL")                                    

Environment variables:

  GITHUB_TOKEN  <value>  - GitHub token  (required)
```
