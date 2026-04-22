This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Dependency Policy (Supply-Chain Guardrail)

**Do not install the latest version of any npm package. Always install the last known stable version.**

This applies to humans and AI agents alike. "Latest" is not a safety signal — freshly published versions have repeatedly been used as a vector for supply-chain attacks (typosquatting, compromised maintainer accounts, malicious post-install scripts). A version that has been in the wild long enough for the community to vet it is materially safer than one published hours or days ago.

### Rules

- **Never run `npm install <pkg>@latest`, `npm install <pkg>` without a pinned version, or `npm update` that bumps to a just-published release.** Prefer an exact version (e.g. `"react": "19.0.0"`), not a range (`^`, `~`).
- **Before adding or bumping a dependency, verify the target version has been published for at least 14 days** (check `npm view <pkg> time`). If it's newer, pick the prior stable release.
- **Review the package's recent release history and maintainer activity** on npm/GitHub before installing. Sudden maintainer changes, a rewritten package, or a suspicious post-install script are red flags — stop and escalate.
- **Agents must not auto-upgrade dependencies.** If a task requires a version bump, propose the specific version and wait for human approval before modifying `package.json` or `package-lock.json`.
- **Always commit the updated `package-lock.json`** so installs are reproducible.

If you are unsure whether a version is safe, do not install it. Ask a maintainer.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
