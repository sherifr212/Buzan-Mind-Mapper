# run.ps1 — Buzan Mind Mapping Software Autonomous Build Runner
# Run from the repo root: .\run.ps1
# Do not close this window. Come back when BUILD_LOG.md shows Sprint 21 complete.

param(
    [int]$RetryWaitMinutes = 65,
    [int]$MaxSessions = 200
)

# ── Logging setup ──────────────────────────────────────────────────────────────
$sessionId  = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$runnerLog  = ".\BUILD_RUNNER_$sessionId.txt"
$transcript = ".\BUILD_TERMINAL_$sessionId.txt"

Start-Transcript -Path $transcript -Append -NoClobber

function Log {
    param([string]$Msg, [string]$Col = "White")
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $Msg"
    Write-Host $line -ForegroundColor $Col
    Add-Content -Path $runnerLog -Value $line -Encoding UTF8
}

function Get-CurrentSprint {
    $lastCommit = git log --oneline 2>$null | Select-Object -First 1
    if ($lastCommit -match "Sprint (\d+) complete") {
        return [int]$Matches[1]
    }
    return -1
}

function Is-BuildComplete {
    $lastCommit = git log --oneline 2>$null | Select-Object -First 1
    return ($lastCommit -match "Sprint 21 complete")
}

# ── Pre-flight checks ──────────────────────────────────────────────────────────
Log "════════════════════════════════════════════════════" "Cyan"
Log "  BUZAN MIND MAPPING — AUTONOMOUS BUILD RUNNER" "Cyan"
Log "════════════════════════════════════════════════════" "Cyan"
Log "Runner log:   $runnerLog" "Gray"
Log "Terminal log: $transcript" "Gray"
Log "" 

foreach ($required in @("CLAUDE.md","TECH_SPEC.md","ACCEPTANCE_TESTS.md","PROJECT_PLAN.md")) {
    if (-not (Test-Path ".\$required")) {
        Log "MISSING: $required — cannot start. Create this file first." "Red"
        Stop-Transcript
        exit 1
    }
}
Log "Pre-flight: all required files present." "Green"

# ── Prompt strings ─────────────────────────────────────────────────────────────
$firstPrompt  = "Read CLAUDE.md in full. Then run git log --oneline to find your current sprint. Begin the autonomous build execution loop described in CLAUDE.md. Do not ask me anything."
$resumePrompt = "Read CLAUDE.md. Run git log --oneline to find your current sprint. Resume the autonomous build from the next sprint. Do not ask me anything."

# ── Main loop ──────────────────────────────────────────────────────────────────
$session = 0

while ($session -lt $MaxSessions) {
    $session++
    $currentSprint = Get-CurrentSprint

    if (Is-BuildComplete) {
        Log "" 
        Log "══ BUILD COMPLETE ══ Sprint 21 committed. v1 SHIPPED." "Green"
        Log "Review FINAL_REPORT.md and BLOCKERS.md in the repo." "Green"
        break
    }

    Log "" 
    Log "── Session $session starting (last completed sprint: $currentSprint) ──" "Cyan"
    Log "Launching Claude Code with --dangerously-skip-permissions" "Yellow"
    Log "" 

    if ($session -eq 1) {
        $prompt = $firstPrompt
    } else {
        $prompt = $resumePrompt
    }

    # Feed the prompt via stdin. Claude Code reads from stdin when not a TTY.
    claude --dangerously-skip-permissions --print $prompt

    $exitCode = $LASTEXITCODE
    Log "" 
    Log "Claude Code exited. Exit code: $exitCode" "Yellow"

    if (Is-BuildComplete) {
        Log "══ BUILD COMPLETE ══ Sprint 21 committed. v1 SHIPPED." "Green"
        break
    }

    $newSprint = Get-CurrentSprint
    Log "Progress: Sprint $currentSprint → Sprint $newSprint completed this session." "Gray"
    Log "Rate limit likely reached. Waiting $RetryWaitMinutes minutes before retry..." "Yellow"
    Log "(The terminal will stay open. Do not close it.)" "Gray"

    # Countdown with one-minute resolution
    for ($remaining = $RetryWaitMinutes; $remaining -gt 0; $remaining--) {
        Write-Progress -Activity "Waiting for rate limit reset" `
                       -Status "$remaining minutes remaining" `
                       -PercentComplete ((($RetryWaitMinutes - $remaining) / $RetryWaitMinutes) * 100)
        Start-Sleep -Seconds 60
        Log "  $remaining min remaining until retry..." "DarkGray"
    }
    Write-Progress -Activity "Waiting" -Completed

    Log "Wait complete. Starting session $($session + 1)..." "Cyan"
}

if ($session -ge $MaxSessions) {
    Log "Max sessions ($MaxSessions) reached. Check BLOCKERS.md." "Red"
}

Log "" 
Log "Runner finished. Transcript saved to: $transcript" "Gray"
Stop-Transcript