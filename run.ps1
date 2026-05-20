[CmdletBinding()]
param(
	[int]$Port = 5173,
	[switch]$Open,
	[switch]$Install
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $AppDir

function Invoke-Pnpm {
	param([string[]]$Arguments)

	if (Get-Command pnpm -ErrorAction SilentlyContinue) {
		& pnpm @Arguments
		return $LASTEXITCODE
	}

	if (Get-Command corepack -ErrorAction SilentlyContinue) {
		& corepack pnpm @Arguments
		return $LASTEXITCODE
	}

	throw "pnpm was not found. Install Node.js 18+ with Corepack, then run: corepack enable"
}

function Get-LocalBin {
	param([string]$Name)

	$cmdPath = Join-Path $AppDir "node_modules\.bin\$Name.CMD"
	if (Test-Path -LiteralPath $cmdPath) {
		return $cmdPath
	}

	$plainPath = Join-Path $AppDir "node_modules\.bin\$Name"
	if (Test-Path -LiteralPath $plainPath) {
		return $plainPath
	}

	return $null
}

if ($Install -or -not (Test-Path -LiteralPath (Join-Path $AppDir "node_modules"))) {
	Write-Host "Installing MAS-LVLR dependencies..."
	$installCode = Invoke-Pnpm @("install")
	if ($installCode -ne 0) {
		exit $installCode
	}
}

$viteArgs = @("dev", "--host", "127.0.0.1", "--port", "$Port")
if ($Open) {
	$viteArgs += "--open"
}

Write-Host "Starting MAS-LVLR at http://127.0.0.1:$Port"
$vite = Get-LocalBin "vite"
if ($vite) {
	& $vite @viteArgs
	exit $LASTEXITCODE
}

$pnpmArgs = @("dev", "--") + $viteArgs[1..($viteArgs.Length - 1)]
$devCode = Invoke-Pnpm $pnpmArgs
exit $devCode
