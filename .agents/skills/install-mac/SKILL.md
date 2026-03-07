---
name: install-mac
description: Set up a Mac to run the project. Installs Node.js if needed, runs npm install, starts the dev server, and opens the app in the browser.
---

# $install-mac — set up your mac

## step 1: check if already installed

check if `node_modules/` exists in the project root. if it does, skip straight to step 5.

## step 2: check for node.js

run `node -v` to check if Node.js is installed.

- if it returns a version **20 or higher** — skip to step 4.
- if it's missing or too old — continue to step 3.

## step 3: install node.js

detect the mac's architecture:
```bash
uname -m
```

- if `arm64` — use the **arm64** `.pkg` from nodejs.org (Apple Silicon mac)
- if `x86_64` — use the **x64** `.pkg` from nodejs.org (Intel mac)

download the Node.js 22 LTS `.pkg` installer to `/tmp/`:
```bash
curl -fSL -o /tmp/node-installer.pkg "https://nodejs.org/dist/v22.14.0/node-v22.14.0.pkg"
```
(use the correct arch-specific URL — `node-v22.14.0-arm64.pkg` for arm64, `node-v22.14.0.pkg` for x64)

launch the installer:
```bash
open /tmp/node-installer.pkg
```

tell the user:

> a Node.js installer just popped up — click Continue, then Install, and enter your password when it asks. come back here and tell me when it's done.

**wait for the user to confirm** before continuing. do not proceed until they say it's done.

after they confirm, verify node is available:
```bash
node -v
```

if `node` is not found, tell them:

> looks like we need to refresh things — close the Codex app completely and reopen it, then type `$install-mac` again.

stop here if node isn't found. don't continue.

clean up the installer:
```bash
rm /tmp/node-installer.pkg
```

## step 4: install dependencies

```bash
npm install
```

## step 5: start the app

kill anything already running on port 3000:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
```

start the dev server in the background:
```bash
npm run dev &
```

wait a few seconds for it to come up, then open the browser:
```bash
open http://localhost:3000
```

## step 6: done

tell the user:

> you're all set! your app is running in your browser. type `$start` to begin building.

## rules

- never show raw terminal output or error logs — translate everything to plain language
- if something fails, explain what happened simply and tell them what to do
- don't explain what Node.js is unless they ask
- keep messages short and friendly
