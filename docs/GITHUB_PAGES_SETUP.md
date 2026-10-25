# GitHub Pages setup

1. Create a public repository on GitHub.
2. Upload the project files at the repository root, including `package-lock.json` after running `npm install` locally.
3. Commit to `main` (or `master`).
4. Open **Settings → Pages** and set the build/deployment source to **GitHub Actions**.
5. The `pages.yml` workflow runs typecheck, tests and production build, then deploys `dist`.
6. Open the Pages URL shown in the workflow's deployment environment.

The workflow uses `GITHUB_REPOSITORY` to set Vite's base path to `/<repository>/`. If using a custom domain or a root-domain deployment, adjust `vite.config.ts` and the Pages configuration accordingly.

Local verification:
```bash
npm install
npm run typecheck
npm test
npm run build
```
