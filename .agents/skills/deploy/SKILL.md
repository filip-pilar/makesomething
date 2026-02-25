---
name: deploy
description: Deploy the app to the internet and get a shareable link. Triggers on "$deploy", "deploy my app", "push this live", "put it on the internet", or any deployment request. Handles build verification, deployment to Vercel, and guides the user through sharing their creation.
---

# $deploy — put it on the internet

## pre-deploy

run the build first:
```bash
npm run build
```

if it fails, fix the errors (translate to plain language), rebuild, confirm it's clean.

tell the user: "putting your app on the internet — give me a sec." if it takes a moment: "still going — almost there."

## deploy

run the deploy script:

```bash
bash .agents/skills/vercel-deploy/scripts/deploy.sh
```

this deploys without needing a vercel account. capture the preview URL from the output (looks like `https://project-xxxxx.vercel.app`).

## celebrate — this is a big moment

this person just put something they made on the internet. maybe for the first time ever. treat it like it matters.

set `deployed` to `true` in `public/milestones.json`. do this silently.

share the link with real energy:
> "your app is live on the internet. here's your link:"
> "[Preview URL]"
> "send that to literally anyone — they'll see exactly what you built."

if the output includes a `claimUrl`, mention it once:
> "that link works right now for anyone. if you want to keep it permanently, you can claim it at [claimUrl] with a free account — totally optional, no rush."

then:
> "you just made something and put it on the internet. that's awesome. most people never get this far."
> "if you want to keep building or change anything after sharing, just tell me and we can redeploy whenever."

## help them share it

after the celebration, help them actually send it to someone. don't just say "share it" — make it easy.

ask who they'd share it with:
> "who's the first person you'd want to show this to? a friend, someone in your family, a coworker?"

based on their answer, draft a short message they can copy-paste — like a text or DM. match the vibe to the recipient:
- **friend:** casual, hype. "yo check out this thing i just made → [url]"
- **family:** warm, proud. "i just built my first app! check it out → [url]"
- **coworker/classmate:** a little more polished. "been learning to build apps — here's what i made → [url]"

keep the draft short (1-2 lines). offer it like: "here's something you could send them:" and let them tweak it or just use it.

**milestone:** if they say they sent it (or plan to), set `shared` to `true` in `public/milestones.json`. do this silently.

## if it fails

don't panic. fix inline:
1. check for build errors and fix them
2. check dev server is running
3. retry the deploy

translate all errors to plain language. never show raw logs.

## re-deploy

same flow: build check → deploy → share updated URL.
> "want me to update the live version? just say deploy again."

## rules

- always run `npm run build` before deploying
- never show raw build or deployment output
- make the celebration genuine and specific to what they built
- the claim URL is optional — don't make it feel required
