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
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - name: Clean npm package
        uses: ai/copy-changelog-to-release@1680ee151d1b693e807c8e9bd95d26c2d57018ac #v1.0.0
```

## Thanks

Based on [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release).
