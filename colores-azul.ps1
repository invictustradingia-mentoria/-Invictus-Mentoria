$utf8 = New-Object System.Text.UTF8Encoding($false)
$map = [ordered]@{
  '#e25822'='#0284c7'
  '#c94a18'='#0369a1'
  '#fff4ef'='#f0f9ff'
  '#fffaf7'='#f8fcff'
  '#f97316'='#0ea5e9'
  '#ea580c'='#0284c7'
  '#fb923c'='#38bdf8'
  '#fed7aa'='#bae6fd'
  '#ffedd5'='#e0f2fe'
  '#fff7ed'='#f0f9ff'
}
$files = Get-ChildItem -Path 'src\app\admin','src\app\dashboard','src\components\admin','src\components\dashboard' -Recurse -Include *.tsx,*.ts,*.css -ErrorAction SilentlyContinue
$changed = 0
foreach ($f in $files) {
  $t = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $o = $t
  foreach ($k in $map.Keys) {
    $t = [regex]::Replace($t, [regex]::Escape($k), $map[$k], [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }
  $t = [regex]::Replace($t, 'orange-(\d{2,3})', 'sky-$1')
  if ($t -ne $o) { [System.IO.File]::WriteAllText($f.FullName, $t, $utf8); $changed++; Write-Host "OK  $($f.Name)" }
}
Write-Host "Archivos modificados: $changed"
Write-Host "--- Restos de naranja (debe quedar vacio) ---"
Get-ChildItem -Path 'src' -Recurse -Include *.tsx,*.ts,*.css | Select-String -Pattern 'orange|e25822|c94a18|fff4ef' | ForEach-Object { "$($_.Path):$($_.LineNumber)" }