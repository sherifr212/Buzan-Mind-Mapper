# run.ps1 — Buzan Mind Mapping Software Autonomous Build Runner
# Usage: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\run.ps1
# Do not close this window. Come back when BUILD_LOG.md shows Sprint 21 complete.

param(
    [int]$RetryWaitMinutes      = 65,
    [int]$MaxSessions           = 200,
    [int]$SessionTimeoutMinutes = 120,
    [int]$MaxTurns              = 150
)

$script:claudeJob  = $null
$script:totalCost  = 0.0
$lockFile          = ".\BUILD_RUNNER.lock"

$sessionId  = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$runnerLog  = ".\BUILD_RUNNER_$sessionId.txt"
$transcript = ".\BUILD_TERMINAL_$sessionId.txt"
$rawJsonLog = ".\BUILD_RAW_JSON_$sessionId.jsonl"

Start-Transcript -Path $transcript -Append -NoClobber

function Log {
    param([string]$Msg, [string]$Col = "White")
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $Msg"
    Write-Host $line -ForegroundColor $Col
    Add-Content -Path $runnerLog -Value $line -Encoding UTF8
}

function Get-CurrentSprint {
    $lastCommit = git log --oneline 2>$null | Select-Object -First 1
    if ($lastCommit -match "Sprint (\d+) complete") { return [int]$Matches[1] }
    return -1
}

function Is-BuildComplete {
    $lastCommit = git log --oneline 2>$null | Select-Object -First 1
    return ($lastCommit -match "Sprint 21 complete")
}

function Invoke-ClaudeStreaming {
    param([string]$Prompt)

    $repoRoot    = $PWD.Path
    $rjLog       = $rawJsonLog
    $chromaToken = $env:CHROMATIC_PROJECT_TOKEN
    $mt          = $MaxTurns

    $script:claudeJob = Start-Job -ScriptBlock {
        param($p, $rj, $root, $mt, $chromaToken)

        Set-Location $root

        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("PATH","User")

        if ($chromaToken) { $env:CHROMATIC_PROJECT_TOKEN = $chromaToken }

        & claude --dangerously-skip-permissions --print "$p" --output-format stream-json --max-turns $mt 2>&1 |
        ForEach-Object {
            Add-Content -Path $rj -Value $_ -Encoding UTF8
            $_
        }

    } -ArgumentList $Prompt, $rjLog, $repoRoot, $mt, $chromaToken

    $sessionStart = Get-Date

    try {
        while ($true) {

            if ((Get-Date) - $sessionStart -gt (New-TimeSpan -Minutes $SessionTimeoutMinutes)) {
                Log "  [TIMEOUT] Session exceeded $SessionTimeoutMinutes minutes. Forcing restart." "Red"
                break
            }

            $output = Receive-Job -Job $script:claudeJob

            foreach ($raw in $output) {
                try {
                    $ev = $raw | ConvertFrom-Json -ErrorAction Stop

                    switch ($ev.type) {

                        "system" {
                            Log "  [INIT] Claude Code session started." "DarkGray"
                        }

                        "assistant" {
                            if ($ev.message -and $ev.message.content) {
                                foreach ($block in $ev.message.content) {
                                    if ($block.type -eq "text" -and $block.text) {
                                        foreach ($l in ($block.text -split "`n")) {
                                            if ($l.Trim()) { Log "  $l" "White" }
                                        }
                                    }
                                }
                            }
                        }

                        "tool_use" {
                            $inputJson = if ($ev.input) {
                                $ev.input | ConvertTo-Json -Compress -Depth 3
                            } else { "" }
                            if ($inputJson.Length -gt 120) {
                                $inputJson = $inputJson.Substring(0, 120) + "..."
                            }
                            Log "  -> TOOL  $($ev.name)  $inputJson" "Cyan"
                        }

                        "tool_result" {
                            $content = ""
                            if ($ev.content -is [string]) {
                                $content = $ev.content
                            } elseif ($ev.content -and $ev.content.Count -gt 0) {
                                $content = ($ev.content | ForEach-Object { $_.text }) -join " "
                            }
                            if ($content.Length -gt 120) { $content = $content.Substring(0, 120) + "..." }
                            if ($content.Trim()) { Log "    <- RESULT  $content" "DarkCyan" }
                        }

                        "result" {
                            $sessionCost       = if ($ev.cost_usd) { [double]$ev.cost_usd } else { 0.0 }
                            $script:totalCost += $sessionCost
                            $costStr           = if ($sessionCost -gt 0) { "session:`$$([math]::Round($sessionCost,4))" } else { "" }
                            $totalStr          = "total:`$$([math]::Round($script:totalCost,4))"
                            $turns             = if ($ev.num_turns)   { "turns:$($ev.num_turns)" }  else { "" }
                            $stopReason        = if ($ev.stop_reason) { "stop:$($ev.stop_reason)" } else { "" }
                            Log "  [DONE] $stopReason  $turns  $costStr  $totalStr" "Green"
                        }

                        default {
                            Log "  [EVT:$($ev.type)] $raw" "DarkGray"
                        }
                    }
                }
                catch {
                    if ($raw.Trim()) { Log "  $raw" "DarkYellow" }
                }
            }

            if ($script:claudeJob.State -in @("Completed","Failed","Stopped")) { break }
            Start-Sleep -Milliseconds 200
        }

        Receive-Job -Job $script:claudeJob | ForEach-Object {
            if ($_.Trim()) { Log "  $_" "DarkYellow" }
        }
    }
    finally {
        if ($script:claudeJob) {
            Stop-Job   -Job $script:claudeJob -ErrorAction SilentlyContinue
            Remove-Job -Job $script:claudeJob -ErrorAction SilentlyContinue
            $script:claudeJob = $null
        }
    }
}

# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
try {

    if (Test-Path $lockFile) {
        $lockContent = Get-Content $lockFile -Raw
        Log "ERROR: Another instance of run.ps1 appears to be running." "Red"
        Log "Lockfile: $lockContent" "Red"
        Log "If no other instance is running, delete BUILD_RUNNER.lock and retry." "Yellow"
        Stop-Transcript; exit 1
    }
    "PID:$PID started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Set-Content $lockFile

    Log "════════════════════════════════════════════════════" "Cyan"
    Log "  BUZAN MIND MAPPING — AUTONOMOUS BUILD RUNNER" "Cyan"
    Log "════════════════════════════════════════════════════" "Cyan"
    Log "Runner log:   $runnerLog"  "Gray"
    Log "Terminal log: $transcript" "Gray"
    Log "Raw JSON log: $rawJsonLog" "Gray"
    Log "Max turns per session: $MaxTurns" "Gray"
    Log ""
    Log "-- Pre-flight checks --" "Cyan"

    # Required documents
    foreach ($f in @("CLAUDE.md","TECH_SPEC.md","ACCEPTANCE_TESTS.md","PROJECT_PLAN.md")) {
        if (-not (Test-Path ".\$f")) {
            Log "MISSING: $f -- cannot start." "Red"
            Stop-Transcript; exit 1
        }
    }
    Log "Documents: all present." "Green"

    # CSharpier hook file
    if (-not (Test-Path ".\.githooks\pre-commit")) {
        Log "ERROR: .githooks/pre-commit not found. Place the hook file in the repo." "Red"
        Stop-Transcript; exit 1
    }
    $hooksPath = git config core.hooksPath 2>$null
    if ($hooksPath -ne ".githooks") {
        Log "WARNING: git core.hooksPath is '$hooksPath' (expected '.githooks')." "Yellow"
        Log "         Claude will register it in Sprint 0 Step 2." "Yellow"
    } else {
        Log "CSharpier pre-commit hook: registered." "Green"
    }

    # CSharpier — verified via dotnet CLI which handles global tool dispatch
    $csharpierVer = dotnet csharpier --version 2>$null
    if (-not $csharpierVer) {
        Log "ERROR: CSharpier not found. Install it with:" "Red"
        Log "       dotnet tool install --global csharpier" "Yellow"
        Stop-Transcript; exit 1
    }
    Log "CSharpier: $csharpierVer" "Green"

    # Git identity
    $gitName  = git config user.name  2>$null
    $gitEmail = git config user.email 2>$null
    if (-not $gitName -or -not $gitEmail) {
        Log "ERROR: Git identity not configured. Commits will fail." "Red"
        Log "  git config --global user.name 'Your Name'" "Yellow"
        Log "  git config --global user.email 'you@example.com'" "Yellow"
        Stop-Transcript; exit 1
    }
    Log "Git identity: $gitName <$gitEmail>" "Green"

    # Node.js >= 18
    $nodeVer = node --version 2>$null
    if (-not $nodeVer) {
        Log "ERROR: Node.js not found. Install Node 18+." "Red"
        Stop-Transcript; exit 1
    }
    $nodeVerNum = [int]($nodeVer -replace 'v(\d+)\..*', '$1')
    if ($nodeVerNum -lt 18) {
        Log "ERROR: Node.js $nodeVer is below minimum v18. Install Node 18+." "Red"
        Stop-Transcript; exit 1
    }
    Log "Node.js: $nodeVer" "Green"

    # .NET SDK
    $dotnetVer = dotnet --version 2>$null
    if (-not $dotnetVer) {
        Log "ERROR: .NET SDK not found. Install .NET 8 SDK." "Red"
        Stop-Transcript; exit 1
    }
    Log ".NET SDK: $dotnetVer" "Green"

    # Claude Code
    $claudeVer = claude --version 2>$null
    if (-not $claudeVer) {
        Log "ERROR: claude not found. Is Claude Code installed and in PATH?" "Red"
        Stop-Transcript; exit 1
    }
    Log "Claude Code: $claudeVer" "Green"

    # Docker
    $dockerVer = docker --version 2>$null
    if (-not $dockerVer) {
        Log "WARNING: Docker not found. Needed for PostgreSQL and Redis in Sprint 14." "Yellow"
        Log "         Install Docker Desktop: https://docker.com" "Yellow"
    } else {
        Log "Docker: $dockerVer" "Green"
        $dockerInfo = docker info 2>$null
        if (-not $dockerInfo) {
            Log "WARNING: Docker installed but daemon not running. Start Docker Desktop." "Yellow"
        } else {
            Log "Docker daemon: running." "Green"
        }
    }

    # Chromatic token
    if (-not $env:CHROMATIC_PROJECT_TOKEN) {
        Log "WARNING: CHROMATIC_PROJECT_TOKEN not set. Visual tests will be skipped." "Yellow"
        Log "         Set it: `$env:CHROMATIC_PROJECT_TOKEN = 'your-token'" "Yellow"
    } else {
        Log "Chromatic token: present." "Green"
    }

    # src/ folder
    if (-not (Test-Path ".\src")) {
        Log "src/ not found. Creating it." "Yellow"
        New-Item -ItemType Directory -Path ".\src" | Out-Null
    }
    Log "src/ folder: present." "Green"

    Log ""
    Log "Pre-flight complete. Starting build." "Green"
    Log ""

    $firstPrompt  = "Read CLAUDE.md in full. Then run git log --oneline from the repo root to find your current sprint. Begin the autonomous build execution loop described in CLAUDE.md. Do not ask me anything."
    $resumePrompt = "Read CLAUDE.md. Run git log --oneline from the repo root to find your current sprint. Resume the autonomous build from the next sprint. Do not ask me anything."

    $session = 0

    while ($session -lt $MaxSessions) {
        $session++
        $currentSprint = Get-CurrentSprint

        if (Is-BuildComplete) {
            Log ""
            Log "BUILD COMPLETE -- Sprint 21 committed. v1 SHIPPED." "Green"
            Log "Review FINAL_REPORT.md and BLOCKERS.md in the repo." "Green"
            break
        }

        Log "-- Session $session starting (last completed sprint: $currentSprint) --" "Cyan"
        Log ""

        $prompt = if ($session -eq 1) { $firstPrompt } else { $resumePrompt }
        Invoke-ClaudeStreaming -Prompt $prompt

        if (Is-BuildComplete) {
            Log ""
            Log "BUILD COMPLETE -- Sprint 21 committed. v1 SHIPPED." "Green"
            Log "Review FINAL_REPORT.md and BLOCKERS.md in the repo." "Green"
            break
        }

        $newSprint    = Get-CurrentSprint
        $madeProgress = ($newSprint -gt $currentSprint)

        Log ""
        if ($madeProgress) {
            Log "Progress: Sprint $currentSprint -> Sprint $newSprint." "Green"
            Log "Rate limit likely reached. Waiting $RetryWaitMinutes minutes..." "Yellow"
            $waitMinutes = $RetryWaitMinutes
        } else {
            Log "No sprint progress (still on Sprint $currentSprint). Possible error." "Yellow"
            Log "Short wait of 5 minutes before retry..." "Yellow"
            $waitMinutes = 5
        }
        Log "(Press Ctrl+C to stop cleanly at any time.)" "DarkGray"
        Log ""

        for ($remaining = $waitMinutes; $remaining -gt 0; $remaining--) {
            Write-Progress -Activity "Cooldown before session $($session + 1)" `
                           -Status   "$remaining min remaining  |  total cost: `$$([math]::Round($script:totalCost,4))" `
                           -PercentComplete ((($waitMinutes - $remaining) / $waitMinutes) * 100)
            Start-Sleep -Seconds 60
            if ($remaining % 5 -eq 0) { Log "  $remaining min remaining..." "DarkGray" }
        }
        Write-Progress -Activity "Cooldown" -Completed
        Log ""
        Log "Cooldown complete. Starting session $($session + 1)..." "Cyan"
        Log ""
    }

    if ($session -ge $MaxSessions) {
        Log "Max sessions ($MaxSessions) reached. Check BLOCKERS.md." "Red"
    }

}
finally {
    if ($script:claudeJob) {
        Log ""
        Log "Stopping Claude Code subprocess..." "Yellow"
        Stop-Job   -Job $script:claudeJob -ErrorAction SilentlyContinue
        Remove-Job -Job $script:claudeJob -ErrorAction SilentlyContinue
    }

    if (Test-Path $lockFile) {
        Remove-Item $lockFile -ErrorAction SilentlyContinue
    }

    Log ""
    Log "Total cost across all sessions: `$$([math]::Round($script:totalCost,4))" "Cyan"
    Log "All logs saved. Runner stopped." "Gray"
    Stop-Transcript
}
