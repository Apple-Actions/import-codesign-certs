## Code in Master

Install the dependencies  
```bash
$ yarn install
```

Build the code
```bash
$ yarn all
```

## Release

`package.json` `version` is the version currently queued for the next release. Merge work to `main`, then ship with **Actions → Release → Run workflow** (default branch). CI tags `vX.Y.Z`, moves the major `vX` tag, creates a GitHub Release, and bumps `package.json` to the next minor so later changes queue for that version. Consumers on `@vN` pick up the new tip when the major tag moves.

For a major or patch instead of the queued minor, edit `package.json` on a PR first, merge, then run Release.
