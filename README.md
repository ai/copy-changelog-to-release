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
      contents: read
      id-token: write
    steps:
      - name: Checkout the repository
        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
      - name: Clean npm package
        uses: ai/copy-changelog-to-release@907fd240473b0935f716efdedf9fa660ba874737 # 0.1.0
```

## Thanks

Based on [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release).
