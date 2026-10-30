$utf8 = New-Object System.Text.UTF8Encoding($false)

function Patch($path, $pairs) {
  if (-not (Test-Path -LiteralPath $path)) { Write-Host "NO EXISTE: $path" -ForegroundColor Red; return }
  $t = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  foreach ($p in $pairs) {
    $old = $p[0]; $new = $p[1]; $label = $p[2]; $marker = $p[3]
    if ($t.Contains($marker)) { Write-Host "YA APLICADO: $label" -ForegroundColor Yellow; continue }
    if ($t.Contains($old)) { $t = $t.Replace($old, $new); Write-Host "OK: $label" -ForegroundColor Green }
    else { Write-Host "NO ENCONTRADO: $label" -ForegroundColor Red }
  }
  [System.IO.File]::WriteAllText($path, $t, $utf8)
}

Patch 'src\app\admin\content\page.tsx' @(
  ,@('if (!/^https?:\/\//i.test(lessonUrl.trim())) return', 'if (!/^https?:\/\//i.test(lessonUrl.trim()) && !/<iframe[\s\S]*src\s*=/i.test(lessonUrl)) return', 'Validacion: acepta codigo iframe', '<iframe[\s\S]*src')
  ,@("'Enlace (YouTube / Vimeo)'", "'Enlace o embed'", 'Etiqueta de la pestana', 'Enlace o embed')
  ,@('placeholder="https://www.youtube.com/watch?v=..."', 'placeholder="Enlace (YouTube, Vimeo, Bunny, MP4, m3u8...) o codigo embed"', 'Texto de ayuda del campo', 'o codigo embed')
)

Patch 'src\app\admin\live\page.tsx' @(
  ,@("import WorldMap from '@/components/admin/WorldMap'", "import WorldMap from '@/components/admin/WorldMap'`nimport SecurityPanel from '@/components/admin/SecurityPanel'", 'Live: importar panel', 'import SecurityPanel')
  ,@('<div className="inline-flex rounded-2xl bg-gray-100 p-1">', "<SecurityPanel />`n`n      <div className=`"inline-flex rounded-2xl bg-gray-100 p-1`">", 'Live: mostrar panel', '<SecurityPanel />')
)