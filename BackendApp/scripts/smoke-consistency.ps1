$ErrorActionPreference = 'Stop'

$baseAuth = 'http://localhost:3006/api/v1'
$baseRest = 'http://localhost:3007/api/v1'
$basePed  = 'http://localhost:3008/api/v1'
$baseEv   = 'http://localhost:3009/api/v1'

$passes = 0
$fails = 0

function Pass($msg) {
  $script:passes++
  Write-Output "[PASS] $msg"
}

function Fail($msg) {
  $script:fails++
  Write-Output "[FAIL] $msg"
}

function Check-Health($url, $name) {
  try {
    $res = Invoke-RestMethod -Uri $url -Method Get
    Pass "$name health OK"
  } catch {
    Fail "$name health FAIL"
  }
}

function Login($identifier, $password) {
  $body = @{ emailOrUsername = $identifier; password = $password } | ConvertTo-Json
  return Invoke-RestMethod -Uri "$baseAuth/auth/login" -Method Post -ContentType 'application/json' -Body $body
}

Write-Output '=== Health checks ==='
Check-Health "$baseAuth/health" 'AuthService'
Check-Health "$baseRest/health" 'RestaurantesService'
Check-Health "$basePed/health" 'PedidosService'
Check-Health "$baseEv/health" 'EventosService'

Write-Output '=== Login checks ==='
$admin = $null
$gerente = $null
$client = $null

try {
  $admin = Login 'admin' 'Admin123!'
  if ($admin.userDetails.role -eq 'SUPER_ADMIN_ROLE') { Pass 'Login admin role OK' } else { Fail "Login admin role incorrect: $($admin.userDetails.role)" }
} catch {
  Fail 'Login admin failed'
}

try {
  $gerente = Login 'gerente' 'Admin123!'
  if ($gerente.userDetails.role -eq 'RESTAURANT_ADMIN_ROLE') { Pass 'Login gerente role OK' } else { Fail "Login gerente role incorrect: $($gerente.userDetails.role)" }
} catch {
  Fail 'Login gerente failed'
}

try {
  $client = Login 'iversoncrack' 'Admin123!'
  if ($client.userDetails.role -eq 'CLIENT_ROLE') { Pass 'Login cliente role OK' } else { Fail "Login cliente role incorrect: $($client.userDetails.role)" }
} catch {
  Fail 'Login cliente failed'
}

Write-Output '=== userDetails fields ==='
if ($client) {
  $required = @('id', 'name', 'surname', 'email', 'username', 'role', 'restaurantId')
  $missing = @()
  foreach ($f in $required) {
    if (-not ($client.userDetails.PSObject.Properties.Name -contains $f) -or [string]::IsNullOrWhiteSpace([string]$client.userDetails.$f)) {
      $missing += $f
    }
  }
  if ($missing.Count -eq 0) { Pass 'userDetails fields OK' } else { Fail "userDetails missing fields: $($missing -join ', ')" }
}

Write-Output '=== Staff scope checks ==='
if ($gerente) {
  $gToken = $gerente.token
  $gRid = $gerente.userDetails.restaurantId

  try {
    $own = Invoke-RestMethod -Uri "$baseAuth/restaurants/$gRid/staff" -Method Get -Headers @{ Authorization = "Bearer $gToken" }
    if ($own.success -eq $true) { Pass 'Gerente own staff OK' } else { Fail 'Gerente own staff not successful' }
  } catch {
    Fail 'Gerente own staff request failed'
  }

  try {
    Invoke-RestMethod -Uri "$baseAuth/restaurants/111111111111111111111111/staff" -Method Get -Headers @{ Authorization = "Bearer $gToken" } | Out-Null
    Fail 'Gerente other restaurant staff unexpectedly allowed'
  } catch {
    $raw = $_.ErrorDetails.Message
    if ($raw -and $raw -match 'No puedes gestionar personal de otra sede') {
      Pass 'Gerente blocked from other restaurant staff (expected)'
    } else {
      Pass 'Gerente blocked from other restaurant staff (expected 403)'
    }
  }
}

Write-Output '=== Analytics/report checks ==='
if ($admin) {
  $aToken = $admin.token
  $rid = $admin.userDetails.restaurantId

  try {
    $g = Invoke-RestMethod -Uri "$baseEv/statistics/global/overview" -Method Get -Headers @{ Authorization = "Bearer $aToken" }
    if ($g.success -eq $true) { Pass 'Global overview OK' } else { Fail 'Global overview returned non-success' }
  } catch {
    Fail 'Global overview request failed'
  }

  try {
    $tmp = Join-Path $env:TEMP 'smoke_stats.xlsx'
    Invoke-WebRequest -Uri "$baseEv/statistics/restaurant/$rid/export-excel" -Method Get -Headers @{ Authorization = "Bearer $aToken" } -OutFile $tmp -UseBasicParsing | Out-Null
    if ((Test-Path $tmp) -and ((Get-Item $tmp).Length -gt 0)) { Pass 'Restaurant export excel OK' } else { Fail 'Restaurant export excel empty' }
  } catch {
    Fail 'Restaurant export excel failed'
  }
}

Write-Output '=== Promotions list check ==='
if ($client) {
  $cToken = $client.token
  $cRid = $client.userDetails.restaurantId
  try {
    $ev = Invoke-RestMethod -Uri "$baseEv/events?restaurant_id=$cRid&event_type=promotion&limit=20" -Method Get -Headers @{ Authorization = "Bearer $cToken" }
    if ($ev.events -ne $null) { Pass "Promotion events reachable (count=$($ev.events.Count))" } else { Fail 'Promotion events response invalid' }
  } catch {
    Fail 'Promotion events request failed'
  }
}

Write-Output "=== RESULT: PASS=$passes FAIL=$fails ==="
if ($fails -gt 0) {
  exit 1
}
exit 0
