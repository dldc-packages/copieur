# Copieur

Given a `copieur.json` file like this:

```
[
  {
    "repo": "git@github.com:etienne-dldc/shared.git",
    "branch": "main",
    "remotePath": "src/shared",
    "localPath": "src/shared",
    "patterns": [
      "components/button/**/*",
      "components/Modal.tsx",
    ]
  }
]
```

Runnning `copieur` will:

- Clone the `shared` repository in a temporary directory
- Resolve all files matching the patterns in the `shared` repository
- Find all dependencies of the matched files recursively
  - It will resolve both other files as well as dependencies from `package.json`
  - If a dependency is outside of the `remotePath` repository, or not
    resolvable, it will raise an error
- Copy all resolved files to the `localPath` directory
- Install all missing dependencies in the local project

## TODO

- Improve logging
  - Log number of files to sync
  - Log number of dependencies file and packages to install
- Remove files that were not synced
- Detect when pattern find no files
