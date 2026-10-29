export interface UA { browser: string; os: string; device: 'Celular' | 'Tablet' | 'PC' }

export function parseUA(ua?: string | null): UA {
  const s = ua || ''
  let browser = 'Otro'
  if (/Edg\//.test(s)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(s)) browser = 'Opera'
  else if (/SamsungBrowser/.test(s)) browser = 'Samsung Internet'
  else if (/Firefox\/|FxiOS/.test(s)) browser = 'Firefox'
  else if (/Chrome\/|CriOS/.test(s)) browser = 'Chrome'
  else if (/Safari\//.test(s)) browser = 'Safari'

  let os = 'Otro'
  if (/Windows/.test(s)) os = 'Windows'
  else if (/Android/.test(s)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(s)) os = 'iOS'
  else if (/Mac OS X|Macintosh/.test(s)) os = 'macOS'
  else if (/Linux/.test(s)) os = 'Linux'

  const device = /iPad|Tablet/.test(s) ? 'Tablet' : /Mobi|iPhone|Android.+Mobile/.test(s) ? 'Celular' : 'PC'
  return { browser, os, device }
}