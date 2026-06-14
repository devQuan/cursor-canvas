# Release workflow

End-to-end flow from code change to GitHub release and VS Code Marketplace.

## 1. Prepare the release

```bash
cd cursor-canvas
npm test
npm run typecheck
npm run lint
```

Update before commit:

- `package.json` → `"version"` (semver)
- `CHANGELOG.md` → new section with date and notes
- `README.md` if user-facing behavior changed

## 2. Commit and push

```bash
git add -A
git status
git commit -m "chore: release vX.Y.Z"
git push origin main
```

## 3. Tag and GitHub release

```bash
git tag -a vX.Y.Z -m "Cursor Canvas vX.Y.Z"
git push origin vX.Y.Z
```

Create the GitHub release (CLI):

```bash
gh release create vX.Y.Z \
  --title "vX.Y.Z" \
  --notes-file CHANGELOG.md
```

Or create the release on GitHub from the tag and paste the matching `CHANGELOG` section.

## 4. Package the VSIX

```bash
npm run build
npx @vscode/vsce package
# → cursor-canvas-X.Y.Z.vsix
```

Install locally to verify: **Extensions → … → Install from VSIX**.

`.vscodeignore` excludes `src/`, `tests/`, `docs/`, and local `.cursor-canvas/` output so the VSIX stays lean.

## 5. Publish to VS Code Marketplace

Publisher ID: **devQuan**

### First-time auth

1. Create a [Personal Access Token](https://dev.azure.com/) with **Marketplace → Manage** scope.
2. Log in:

```bash
npx @vscode/vsce login devQuan
# paste PAT when prompted
```

Or publish with an env var (no stored token):

```bash
VSCE_PAT="your-pat-here" npx @vscode/vsce publish
```

### Publish

```bash
npx @vscode/vsce publish
```

Alternative: upload the `.vsix` at [Marketplace publisher portal](https://marketplace.visualstudio.com/manage/publishers/devQuan).

### Auth errors

- `TF400813` / not authorized → PAT expired, wrong scope, or wrong publisher. Create a new PAT and run `vsce login` again.
- Version already exists → bump `package.json` version and tag a new release.

## 6. Versioning

| Change | Bump |
|--------|------|
| Bug fix | Patch — `1.0.1` |
| New feature | Minor — `1.1.0` |
| Breaking change | Major — `2.0.0` |

Always tag git: `vX.Y.Z` matching `package.json`.

## 7. Post-release

- Watch [GitHub Issues](https://github.com/devQuan/cursor-canvas/issues) and Marketplace reviews
- Patch critical bugs as `1.0.x` without waiting for feature releases
