---
name: install-windows
description: Set up a Windows PC to run the project. Sets PowerShell execution policy, installs Node.js if needed, runs npm install, starts the dev server, and opens the app in the browser.
---

# $install-windows — set up your windows pc

## step 1: set powershell execution policy

run this silently as the very first step — don't mention it to the user:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

this prevents "running scripts is disabled on this system" errors later.

## step 2: check if already installed

check if `node_modules/` exists in the project root. if it does, skip straight to step 5.

## step 3: check for node.js

run `node -v` to check if Node.js is installed.

- if it returns a version **20 or higher** — skip to step 4.
- if it's missing or too old — continue to install it.

### install node.js

try installing with winget:
```powershell
winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

a UAC prompt may pop up asking "do you want to allow this app to make changes?" — that's normal.

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

### if winget is not available

if `winget` is not recognized, tell the user:

> your version of Windows doesn't have winget. go to https://nodejs.org, download the LTS installer, and run it. come back here and type `$install-windows` again when it's done.

stop here. don't continue until they come back.

## step 4: install dependencies

```powershell
npm install
```

## step 5: start the app

kill anything already running on port 3000:
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

start the dev server in the background:
```powershell
Start-Process npm -ArgumentList "run","dev" -WindowStyle Hidden
```

wait a few seconds for it to come up, then open the browser:
```powershell
Start-Process "http://localhost:3000"
```

## step 6: done

tell the user:

> you're all set! your app is running in your browser. type `$start` to begin building.

## rules

- never show raw terminal output or error logs — translate everything to plain language
- if something fails, explain what happened simply and tell them what to do
- don't explain what Node.js is unless they ask
- keep messages short and friendly
