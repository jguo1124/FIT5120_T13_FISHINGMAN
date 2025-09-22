param(
  [string]$BackendDir = "backend",
  [string]$FrontendDir = ".",
  [int]$BackendPort = 9090,
  [int]$FrontendPort = 5173
)

function Write-Info($msg) {
  Write-Host "[+] $msg" -ForegroundColor Cyan
}

function Write-ErrorExit($msg) {
  Write-Host "[!] $msg" -ForegroundColor Red
  exit 1
}

if (!(Test-Path $BackendDir)) {
  Write-ErrorExit "Backend directory '$BackendDir' not found."
}

$adminPassword = Read-Host -Prompt "Enter ADMIN_PASSWORD" -AsSecureString
if (!$adminPassword) {
  Write-ErrorExit "ADMIN_PASSWORD is required."
}
$adminPasswordBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
try {
  $adminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringUni($adminPasswordBstr)
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($adminPasswordBstr)
}

$authBytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $rng.GetBytes($authBytes)
}
finally {
  $rng.Dispose()
}
$authSecret = [System.Convert]::ToBase64String($authBytes)
$dummyWeatherKey = "dummy-key-" + ([guid]::NewGuid().ToString("N").Substring(0, 12))

Write-Info "Generated AUTH_TOKEN_SECRET and placeholder OPENWEATHER key."

$backendPath = Resolve-Path $BackendDir
$frontendPath = Resolve-Path $FrontendDir

$backendCmd = "cd `"$backendPath`"; $env:ADMIN_PASSWORD='$adminPasswordPlain'; $env:AUTH_TOKEN_SECRET='$authSecret'; if (-not $env:OPENWEATHER_API_KEY) { $env:OPENWEATHER_API_KEY='$dummyWeatherKey'; } npm.cmd install; npm.cmd run dev"
$frontendCmd = "cd `"$frontendPath`"; npm.cmd install; npm.cmd run dev"

Write-Info "Starting backend (port $BackendPort)..."
$backendProcess = Start-Process powershell -ArgumentList "-NoLogo","-NoProfile","-Command",$backendCmd -PassThru
Start-Sleep -Seconds 3

Write-Info "Starting frontend (port $FrontendPort)..."
$frontendProcess = Start-Process powershell -ArgumentList "-NoLogo","-NoProfile","-Command",$frontendCmd -PassThru

Write-Info "Backend PID: $($backendProcess.Id)"
Write-Info "Frontend PID: $($frontendProcess.Id)"
Write-Info "Press Ctrl+C to stop both processes."

try {
  while ($backendProcess -and !$backendProcess.HasExited -and $frontendProcess -and !$frontendProcess.HasExited) {
    Start-Sleep -Seconds 2
  }
}
finally {
  if ($backendProcess -and !$backendProcess.HasExited) {
    Write-Info "Stopping backend..."
    $backendProcess | Stop-Process
  }
  if ($frontendProcess -and !$frontendProcess.HasExited) {
    Write-Info "Stopping frontend..."
    $frontendProcess | Stop-Process
  }
}



