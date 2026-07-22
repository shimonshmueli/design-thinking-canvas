# Deploying the cloud (team-sync) version

This folder is now a complete, self-contained app: the same Design Thinking Canvas you've
been using locally, plus a serverless API (`api/`) and a Postgres schema (`schema.sql`) —
everything needed for real, cross-device team collaboration. Deploy it from right here, the
project root.

(There's also a `cloud-deploy/` subfolder from an earlier attempt — ignore it, it's a
duplicate of the same files. This root folder is the one to deploy.)

## One-time setup (from a terminal, inside this folder)

```
npm install -g vercel        # if you don't already have the Vercel CLI
cd "Design Thinking Canvas"  # this folder
vercel login                 # opens a browser to sign in / create a free account
vercel link                  # creates the Vercel project — accept the defaults
vercel install neon          # provisions a free Postgres database and wires it in automatically
vercel --prod                # deploys everything live
```

`vercel --prod` prints the live URL when it finishes (something like
`https://design-thinking-canvas-<random>.vercel.app`). That's the link to share with your
team — anyone who opens it can work solo, or click **Team** to start or join a cloud-synced
project with a 6-character code.

## Redeploying after any future edit

```
cd "Design Thinking Canvas"
vercel --prod
```

## How it works

- `index.html`, `report.html`, `stages/`, `tools/`, and the shared `.js`/`.css` files are the
  app exactly as you've used it locally — unaffected for solo use.
- `api/` is a small serverless backend (Node, using the `pg` package) that `sync.js` talks to
  once someone starts or joins a team.
- `schema.sql` creates its own tables automatically on first request — no manual database
  setup beyond `vercel install neon`.
- Nothing here requires a paid plan; Vercel's Hobby tier and Neon's free tier both work.

## About the current live URL

An earlier automated attempt (using an AI-agent deploy tool rather than the CLI above) left
a *broken, partial* deployment live at whatever URL it printed — that attempt hit a hard
limit on how much file content can be inlined into a single tool call and only pushed a
handful of files. Running `vercel link` (pointing at that same project) and then
`vercel --prod` from here will fully overwrite it with the real, complete site — that's the
fix, not a separate cleanup step.
