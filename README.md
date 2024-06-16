# GitRoll Scanning Action

> [!IMPORTANT]
> The action mode `wait` still in development.

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
  schedule:
    - cron: "30 0 * * *"
  workflow_dispatch:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: GitRoll Scan
        uses: brenoepics/gitroll-action@v0.1.0
```

This workflow will run every day at midnight and request a scan for the repository owner username,
you can also specify the username with the `username` input.

```yaml
      - name: GitRoll Scan
        uses: brenoepics/gitroll-action@v0.1.0
        with:
          username: 'brenoepics'
```

Result:

`<a href="https://gitroll.io/profile/<gitroll-id>" target="_blank"><img src="https://gitroll.io/api/badges/profiles/v1/<gitroll-id>" alt="GitRoll Profile Badge"/></a>`

<a href="https://gitroll.io/profile/udhZiC3HdZ5Sd0oAH3pQ7wAGhACi1" target="_blank"><img src="https://gitroll.io/api/badges/profiles/v1/udhZiC3HdZ5Sd0oAH3pQ7wAGhACi1" alt="GitRoll Profile Badge"/></a>
</details>

## License

This project is licensed under MIT License.
See the [LICENSE](LICENSE) file for
details.
