import nodemailer from 'nodemailer'

// Envío de correos por Gmail (contraseña de aplicación). Variables en Netlify: GMAIL_USER y GMAIL_APP_PASSWORD.
export function mailConfigured(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: (process.env.GMAIL_USER || '').trim(),
        pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
      },
    })
  }
  return transporter
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  if (!mailConfigured()) throw new Error('El correo no está configurado (faltan GMAIL_USER y GMAIL_APP_PASSWORD).')
  const user = (process.env.GMAIL_USER || '').trim()
  await getTransporter().sendMail({
    from: `"Invictus Campus" <${user}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  })
}