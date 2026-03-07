---
name: install-windows
description: Set up a Windows PC to run the project. Sets PowerShell execution policy, installs Node.js if needed, and runs npm install.
---

# $install-windows — set up your windows pc

## how to talk during install

**do not narrate technical steps.** the user doesn't need to know what you're checking or installing behind the scenes. keep all checks, downloads, and installs silent unless you need the user to do something.

only talk to the user at these moments:
- **start:** "setting things up — give me a sec"
- **permission prompt:** tell them to click Yes (see step 3)
- **done:** "you're all set! type `$start` to begin building"
- **something went wrong:** explain simply, no technical terms

never mention `node_modules`, `node -v`, version numbers, npm, winget, PowerShell, PATH, or any technical terms in messages to the user.

## step 1: set powershell execution policy

silently run this as the very first step — don't mention it to the user:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## step 2: check if already installed

silently check if `node_modules/` exists in the project root. if it does, tell the user:

> you're already set up! type `$start` to begin building.

stop here. don't continue.

## step 3: check for node.js

tell the user:

> setting things up — give me a sec.

silently run `node -v` to check if Node.js is installed.

- if it returns a version **20 or higher** — skip to step 4.
- if it's missing or too old — continue to install it.

### install node.js

run winget to install Node.js. this command needs to run **outside the sandbox** — Codex will prompt the user to approve it, which is fine:
```powershell
winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

tell the user:

> installing something we need — you might see a prompt asking to allow changes, click Yes.

after it finishes, silently refresh the PATH:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
```

silently verify node is available:
```powershell
node -v
```

if `node` is still not found, tell the user:

> hmm, let's try a quick fix — close Codex completely and reopen it, then type `$install-windows` again.

stop here if node isn't found. don't continue.

## step 4: install dependencies

silently run:
```powershell
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
- never mention Node.js, npm, node_modules, winget, PowerShell, or version numbers unless the user asks
- keep messages short and friendly
