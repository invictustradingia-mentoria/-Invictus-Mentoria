import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * NOTA DE ARQUITECTURA - NETLIFY SERVERLESS:
 * En Netlify no existe un sistema de archivos persistente entre invocaciones.
 * Para producción debes almacenar los videos en un servicio externo:
 *   - Cloudinary (recomendado para video)
 *   - Bunny.net CDN
 *   - AWS S3 / DigitalOcean Spaces
 *   - Supabase Storage
 *
 * Este endpoint valida el archivo y retorna instrucciones para upload directo
 * al servicio CDN configurado. Si no hay CDN configurado, rechaza el upload
 * con un mensaje claro.
 *
 * Para configurar Cloudinary añade a Netlify Environment Variables:
 *   CLOUDINARY_CLOUD_NAME=tu_cloud_name
 *   CLOUDINARY_API_KEY=tu_api_key
 *   CLOUDINARY_API_SECRET=tu_api_secret
 */

export async function GET() {
  return NextResponse.json({
    message: 'Upload endpoint active',
    note: 'Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in environment variables for video uploads.',
    cloudinaryConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 })
    }

    // Check if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error:
            'Almacenamiento en la nube no configurado. Añade CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET a las variables de entorno de Netlify. Mientras tanto, usa la opción "Enlace Externo (URL)" para añadir videos de YouTube, Vimeo o Bunny.net.',
          setupRequired: true,
        },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo' }, { status: 400 })
    }

    // Validate video type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska']
    if (!validTypes.some((t) => file.type.startsWith(t.split('/')[0])) && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Formato no válido. Sube un archivo de video (MP4, WebM, MOV, MKV).' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const timestamp = Math.round(Date.now() / 1000)
    const crypto = await import('crypto')
    const signature = crypto
      .createHash('sha1')
      .update(`folder=invictus-videos&timestamp=${timestamp}&upload_preset=ml_default${apiSecret}`)
      .digest('hex')

    const uploadFormData = new FormData()
    uploadFormData.append('file', dataUri)
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('timestamp', timestamp.toString())
    uploadFormData.append('signature', signature)
    uploadFormData.append('folder', 'invictus-videos')
    uploadFormData.append('resource_type', 'video')

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json().catch(() => ({}))
      console.error('Cloudinary error:', errorData)
      return NextResponse.json(
        { error: 'Error al subir el video al servicio de almacenamiento en la nube.' },
        { status: 500 }
      )
    }

    const cloudinaryData = await cloudinaryResponse.json()

    return NextResponse.json({
      success: true,
      url: cloudinaryData.secure_url,
      filename: file.name,
      size: file.size,
      duration: cloudinaryData.duration ? Math.round(cloudinaryData.duration) : null,
      provider: 'cloudinary',
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json({ error: 'Error al procesar y subir el video' }, { status: 500 })
  }
}
