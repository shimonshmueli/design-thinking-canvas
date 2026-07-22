**Superseded — ignore this folder.** Deploy from the project root instead: see `../DEPLOY.md`.
This subfolder was an earlier duplicate copy and is kept only because files here can't be
deleted; the root now has the same `api/`, `lib/`, `schema.sql`, and `package.json` alongside
the actual app files, which is the correct place to run `vercel` from.

---

# Deploying the cloud (team-sync) version

This folder is a complete, self-contained copy of the app plus a serverless API and
Postgres schema — everything needed for real, cross-device team collaboration.

## One-time setup (from a terminal, inside this folder)

```
npm install -g vercel        # if you don't already have the Vercel CLI
cd "cloud-deploy"            # this folder
vercel login                 # opens a browser to sign in / create a free account
vercel link                  # creates the Vercel project — accept the defaults
vercel install neon          # provisions a free Postgres database and wires it in automatically
vercel --prod                # deploys everything live
```

`vercel --prod` prints the live URL when it finishes (something like
`https://design-thinking-canvas-<random>.vercel.app`). That's the link to share with
your team — anyone who opens it can work solo, or click **Team** to start/join a
cloud-synced project.

## Redeploying after any future edit

```
cd "cloud-deploy"
vercel --prod
```

## How it works

- `index.html`, `report.html`, `stages/`, `tools/`, and the shared `.js`/`.css` files are
  the same app you've been using locally — untouched for solo use.
- `api/` is a small serverless backend (Node, using the `pg` package) that the `sync.js`
  file talks to once someone starts or joins a team.
- `schema.sql` creates its own tables automatically on first use — no manual database
  setup beyond `vercel install neon`.
- Nothing here requires a paid plan; Vercel's Hobby tier and Neon's free tier both work.
