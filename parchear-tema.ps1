# Ejecutar desde la carpeta invictus-app:  powershell -ExecutionPolicy Bypass -File .\parchear-tema.ps1
# Hace que el login acepte correo O nombre de usuario (cambia type="email" por type="text" en la pagina de login).
$f = "src\app\login\page.tsx"
if (Test-Path -LiteralPath $f) {
  $t = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $f))
  $n = [regex]::Replace($t, 'type="email"', 'type="text" autoCapitalize="none"')
  if ($n -ne $t) { [IO.File]::WriteAllText((Resolve-Path -LiteralPath $f), $n); Write-Host "OK: login ahora acepta correo o usuario" }
  else { Write-Host "No encontre type=email en el login (quiza ya esta cambiado)" }
} else { Write-Host "No existe $f" }
