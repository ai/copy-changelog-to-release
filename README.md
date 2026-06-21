# Copy ChangeLog to Release

This action to create GitHub Releases based on latest record in `CHANGELOG.md` file.

```yml
# Create release on tag
on:
  push:
    tags:
      - '*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout the repository
        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
      - name: Clean npm package
        uses: ai/copy-changelog-to-release@a6dc825c34575add2da2060796794f7b84894628 # v0.2.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Options

### `latest`

Whether to mark the created/updated release as the latest. Defaults to `true`.
Set to `false` to avoid moving the `latest` tag (useful when releasing a patch
for an older major version).

```yml
- uses: ai/copy-changelog-to-release@…
  with:
    latest: false
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Thanks

Based on [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release).
