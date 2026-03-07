---
name: install-mac
description: Set up a Mac to run the project. Installs Node.js if needed and runs npm install.
---

# $install-mac — set up your mac

## how to talk during install

**do not narrate technical steps.** the user doesn't need to know what you're checking or installing behind the scenes. keep all checks, downloads, and installs silent unless you need the user to do something.

only talk to the user at these moments:
- **start:** "setting things up — give me a sec"
- **installer pops up:** tell them what to click (see step 3)
- **done:** "you're all set! type `$start` to begin building"
- **something went wrong:** explain simply, no technical terms

never mention `node_modules`, `node -v`, version numbers, npm, curl, or any technical terms in messages to the user.

## step 1: check if already installed

silently check if `node_modules/` exists in the project root. if it does, tell the user:

> you're already set up! type `$start` to begin building.

stop here. don't continue.

## step 2: check for node.js

tell the user:

> setting things up — give me a sec.

silently run `node -v` to check if Node.js is installed.

- if it returns a version **20 or higher** — skip to step 4.
- if it's missing or too old — continue to step 3.

## step 3: install node.js

look up the latest LTS version from nodejs.org:
```bash
curl -fsSL https://nodejs.org/dist/index.json | python3 -c "import json,sys; print(next(r['version'] for r in json.load(sys.stdin) if r.get('lts')))"
```

the `.pkg` installer is universal (works on both Apple Silicon and Intel). download it:
```bash
curl -fSL -o /tmp/node-installer.pkg "https://nodejs.org/dist/{VERSION}/node-{VERSION}.pkg"
```

launch the installer:
```bash
open /tmp/node-installer.pkg
```

tell the user:

> an installer just popped up — click Continue, then Install, and enter your password when it asks. come back here and tell me when it's done.

**wait for the user to confirm** before continuing. do not proceed until they say it's done.

silently verify node is available:
```bash
node -v
```

if `node` is not found, tell them:

> hmm, let's try a quick fix — close Codex completely and reopen it, then type `$install-mac` again.

stop here if node isn't found. don't continue.

silently clean up:
```bash
rm /tmp/node-installer.pkg
```

## step 4: install dependencies

silently run:
```bash
npm install
```

this takes a minute or two. don't say anything unless it fails.

## step 5: done

tell the user:

> you're all set! type `$start` to begin building.

## rules

- **keep technical stuff invisible** — the user should only see friendly, simple messages
- never show raw terminal output, error logs, file paths, or command names
- if something fails, explain what happened in one simple sentence and what to do next
- never mention Node.js, npm, node_modules, or version numbers unless the user asks
- keep messages short and friendly
