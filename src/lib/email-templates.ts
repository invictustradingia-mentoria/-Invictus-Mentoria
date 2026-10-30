const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(title: string, body: string) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#f0f9ff;font-family:Arial,Helvetica,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;border:1px solid #bae6fd;overflow:hidden">
<tr><td style="background:#0284c7;padding:22px 28px;color:#ffffff">
<div style="font-size:12px;letter-spacing:2px;font-weight:bold;opacity:.85">INVICTUS</div>
<div style="font-size:22px;font-weight:bold;margin-top:2px">${esc(title)}</div>
</td></tr>
<tr><td style="padding:28px;font-size:14px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f8fcff;font-size:11px;color:#6b7280;border-top:1px solid #e0f2fe">
Este mensaje fue enviado automáticamente por Invictus Campus. Si no esperabas este correo, puedes ignorarlo.
</td></tr></table></td></tr></table></body></html>`
}

const button = (href: string, label: string) =>
  `<p style="text-align:center;margin:26px 0"><a href="${esc(href)}" style="background:#0284c7;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:12px;display:inline-block">${esc(label)}</a></p>
<p style="font-size:11px;color:#6b7280;word-break:break-all">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${esc(href)}</p>`

export function resetEmail(name: string | null, link: string) {
  const hi = name ? `Hola ${esc(name)},` : 'Hola,'
  return {
    subject: 'Restablece tu contraseña de Invictus Campus',
    html: layout('Restablecer contraseña', `
<p>${hi}</p>
<p>Recibimos una solicitud para crear una contraseña nueva en tu cuenta de Invictus Campus.</p>
${button(link, 'Crear mi nueva contraseña')}
<p><b>El enlace es válido por 1 hora</b> y solo se puede usar una vez.</p>
<p>Si tú no lo pediste, ignora este correo: tu contraseña actual seguirá funcionando.</p>`),
    text: `${name ? `Hola ${name},` : 'Hola,'}\n\nPara crear una contraseña nueva en Invictus Campus abre este enlace (válido por 1 hora, un solo uso):\n${link}\n\nSi no lo pediste, ignora este correo.`,
  }
}

export function welcomeEmail(name: string | null, loginUrl: string, resetLink: string) {
  const hi = name ? `¡Hola ${esc(name)}!` : '¡Hola!'
  return {
    subject: '¡Tu acceso a Invictus Campus fue aprobado!',
    html: layout('¡Ya eres parte de Invictus!', `
<p>${hi}</p>
<p>Tu solicitud fue <b>aprobada</b> y ya puedes entrar a la plataforma. Estos son los pasos:</p>
<ol style="padding-left:18px;margin:14px 0">
<li style="margin-bottom:8px">Entra a <a href="${esc(loginUrl)}" style="color:#0284c7;font-weight:bold">${esc(loginUrl)}</a>.</li>
<li style="margin-bottom:8px">Inicia sesión con <b>este mismo correo</b> y la contraseña que elegiste al registrarte.</li>
<li style="margin-bottom:8px">Desde <b>Mis clases</b> puedes empezar a ver las lecciones, y en <b>Comunidad</b> chatear con otros alumnos.</li>
<li>Revisa <b>Llamadas en vivo</b> para conocer los próximos encuentros por Zoom.</li>
</ol>
<p><b>¿No recuerdas tu contraseña?</b> Crea una nueva con este botón (válido por 7 días):</p>
${button(resetLink, 'Crear / restablecer mi contraseña')}
<p>Más adelante, si la olvidas, puedes pedir una nueva desde la pantalla de inicio de sesión con la opción “¿Olvidaste tu contraseña?”.</p>`),
    text: `${name ? `¡Hola ${name}!` : '¡Hola!'}\n\nTu solicitud fue aprobada. Pasos:\n1) Entra a ${loginUrl}\n2) Inicia sesión con este correo y la contraseña que elegiste al registrarte.\n3) Si no la recuerdas, crea una nueva aquí (válido por 7 días): ${resetLink}\n\nMás adelante puedes usar “¿Olvidaste tu contraseña?” en el inicio de sesión.`,
  }
}