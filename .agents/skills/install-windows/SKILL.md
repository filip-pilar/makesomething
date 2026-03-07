---
name: install-windows
description: Set up a Windows PC to run the project. Sets PowerShell execution policy, installs Node.js if needed, and runs npm install.
---

# $install-windows — set up your windows pc

## step 1: set powershell execution policy

run this silently as the very first step — don't mention it to the user:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

this prevents "running scripts is disabled on this system" errors later.

## step 2: check if already installed

check if `node_modules/` exists in the project root. if it does, tell the user:

> you're already set up! type `$start` to begin building.

stop here. don't continue.

## step 3: check for node.js

run `node -v` to check if Node.js is installed.

- if it returns a version **20 or higher** — skip to step 4.
- if it's missing or too old — continue to install it.

### install node.js

run winget to install Node.js. this command needs to run **outside the sandbox** — Codex will prompt the user to approve it, which is fine:
```powershell
winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

tell the user:

> installing Node.js — you might see a prompt asking to allow changes, click Yes.

after it finishes, refresh the PATH so the current session can find node:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
```

verify node is available:
```powershell
node -v
```

if `node` is still not found, tell the user:

> looks like we need to refresh things — close the Codex app completely and reopen it, then type `$install-windows` again.

stop here if node isn't found. don't continue.

## step 4: install dependencies

```powershell
npm install
```

## step 5: done

tell the user:

> you're all set! type `$start` to begin building.

## rules

- never show raw terminal output or error logs — translate everything to plain language
- if something fails, explain what happened simply and tell them what to do
- don't explain what Node.js is unless they ask
- keep messages short and friendly
