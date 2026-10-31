# Parches del rol Editor para archivos que no se pueden reemplazar enteros.
# Ejecutar desde la carpeta invictus-app:  powershell -ExecutionPolicy Bypass -File .\parchear-editor.ps1
$ErrorActionPreference = 'Stop'
$enc = New-Object System.Text.UTF8Encoding($false)

function Patch([string]$path, [scriptblock]$fn, [string]$label) {
  if (-not (Test-Path -LiteralPath $path)) { Write-Host "NO ENCONTRADO: $path" -ForegroundColor Red; return }
  $txt = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $path), [Text.Encoding]::UTF8)
  $new = & $fn $txt
  if ($new -eq $txt) { Write-Host "SIN CAMBIOS (ya aplicado o no coincide): $label" -ForegroundColor Yellow; return }
  [IO.File]::WriteAllText((Resolve-Path -LiteralPath $path), $new, $enc)
  Write-Host "OK: $label" -ForegroundColor Green
}

$guard1 = "((?:\(session\.user as any\)\?|session\??\.user)\.role|userRole)\s*!==\s*'ADMIN'"
$guard2 = "((?:\(session\.user as any\)\?|session\??\.user)\.role)\s*===\s*'ADMIN'"

# 1) Lecciones y modulos individuales: ahora tambien el editor
$fixGuard = {
  param($t)
  $t = [regex]::Replace($t, $guard1, '!["ADMIN", "EDITOR"].includes($1)')
  $t = [regex]::Replace($t, $guard2, '["ADMIN", "EDITOR"].includes($1)')
  return $t
}
Patch 'src\app\api\admin\lessons\[id]\route.ts' $fixGuard 'api/admin/lessons/[id]'
Patch 'src\app\api\admin\modules\[id]\route.ts' $fixGuard 'api/admin/modules/[id]'

# 2) Video: el editor no se bloquea y ve segun el acceso que le dio el admin
Patch 'src\app\api\student\video\route.ts' { param($t)
  $t = $t.Replace("if (session.user.role !== 'ADMIN') {", "if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {")
  $t = $t.Replace("visibleLevels(session.user.role)", "visibleLevels(session.user.role, session.user.viewLevel)")
  $t } 'api/student/video'

# 3) Mis clases: icono de editor en el banner
Patch 'src\app\dashboard\clases\page.tsx' {
  param($t)
  $t = $t.Replace("m.key === 'ADMIN' ? ShieldCheck : Star", "m.key === 'ADMIN' ? ShieldCheck : m.key === 'EDITOR' ? Pencil : Star")
  if ($t -match "import \{[^}]*\bPencil\b[^}]*\} from 'lucide-react'") { return $t }
  $rx = New-Object System.Text.RegularExpressions.Regex("import \{([^}]*)\} from 'lucide-react'")
  $ev = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) "import {" + $m.Groups[1].Value.TrimEnd() + ", Pencil } from 'lucide-react'" }
  return $rx.Replace($t, $ev, 1)
} 'dashboard/clases (icono editor)'

# 4) Esquema de Prisma: nueva columna editorLevel
Patch 'prisma\schema.prisma' { param($t)
  if ($t -match 'editorLevel') { return $t }
  $t.Replace("  avatarUrl    String?`n", "  avatarUrl    String?`n  editorLevel  String       @default(`"ALL`")`n").Replace("  avatarUrl    String?`r`n", "  avatarUrl    String?`r`n  editorLevel  String       @default(`"ALL`")`r`n")
} 'prisma/schema.prisma (editorLevel)'
