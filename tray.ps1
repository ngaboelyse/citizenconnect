# CitizenConnect - System Tray Icon
# Runs silently in the background; right-click the tray icon to open or exit.

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ── Load icon from the generated .ico file ────────────────────────────────────
$icoPath  = Join-Path $PSScriptRoot "CitizenConnect.ico"
$trayIcon = [System.Drawing.Icon]::new($icoPath)

# ── Tray icon setup ───────────────────────────────────────────────────────────
$notify          = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon     = $trayIcon
$notify.Text     = "CitizenConnect"
$notify.Visible  = $true

# ── Context menu ──────────────────────────────────────────────────────────────
$menu = New-Object System.Windows.Forms.ContextMenuStrip

$itemOpen = $menu.Items.Add("Open CitizenConnect")
$itemOpen.Font = [System.Drawing.Font]::new("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$menu.Items.Add("-") | Out-Null   # separator
$itemExit = $menu.Items.Add("Exit")

$itemOpen.Add_Click({
    Start-Process "http://127.0.0.1:3000"
})

$itemExit.Add_Click({
    $notify.Visible = $false
    $notify.Dispose()
    # Stop the node server
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    [System.Windows.Forms.Application]::Exit()
})

$notify.ContextMenuStrip = $menu

# Double-click opens the app
$notify.Add_DoubleClick({
    Start-Process "http://127.0.0.1:3000"
})

# ── Startup balloon notification ──────────────────────────────────────────────
$phoneUrl = "http://$($env:COMPUTERNAME).local:3000"
$notify.BalloonTipIcon  = [System.Windows.Forms.ToolTipIcon]::Info
$notify.BalloonTipTitle = "CitizenConnect"
$notify.BalloonTipText  = "Running! Phone: $phoneUrl"
$notify.ShowBalloonTip(5000)

# ── Keep alive ────────────────────────────────────────────────────────────────
[System.Windows.Forms.Application]::Run()
