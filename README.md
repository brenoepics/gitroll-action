# GitRoll Scanning Action

This repository contains a GitHub Action that requests a GitRoll scan for a given GitHub user.

## Action Details

The main entry point for the action is `src/index.ts`, which imports and runs
the `run` function from `src/main.ts`. This function retrieves an input named
"username" and "wait" from the action's inputs, and then calls the `requestScan` function from `src/gitroll.ts` with the
given username. The `requestScan` function sends a POST request to the GitRoll API to request a scan for the given
username. The function returns a promise that resolves when the scan is complete.

## Development

The code is written in TypeScript and transpiled to JavaScript for distribution.
The `tsconfig.json` file contains the TypeScript compiler options. The
`package.json` file contains various scripts for formatting, linting, testing,
and building the code. The `preinstall` script ensures that `pnpm` is used as
the package manager.

## Usage

<details>
<summary>Using in your readme</summary>

To use this action in your repository, you can create a workflow file in the
`.github/workflows` directory.
For example, you can create a file named
`scan.yml` with the following content:

```yaml
name: Scan

on:
  cron:
    - '0 0 * * *'

jobs:
    scan:
        runs-on: ubuntu-latest
        steps:
        - name: GitRoll Scan
            uses: brenoepics/gitroll-action@v1
```

This workflow will run every day at midnight and request a scan for the `brenoepics` user.
</details>

<details>
<summary>Using in a workflow</summary>

To use this action in a workflow, you can reference it with the `uses` keyword
and the path to the repository. You can also specify inputs with the `with`
keyword. For example:

```yaml
steps:
  - name: Example Step
    uses: brenoepics/gitroll-action@v1
    with:
        username: 'brenoepics'
        wait: 'true'
```

This will request a scan for the `brenoepics` user and wait for the scan to complete.
</details>

## License

This project is licensed under MIT License.
See the [LICENSE](LICENSE) file for
details.
