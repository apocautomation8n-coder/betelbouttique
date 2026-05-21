import express from 'express'
import supabaseAdmin from '../supabaseAdmin.js'

const router = express.Router()

// POST /api/upload — Upload a base64 encoded file directly to Supabase Storage
router.post('/', async (req, res) => {
  try {
    // Robust parsing in case middleware parsed body as raw text
    let data = req.body
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return res.status(400).json({ error: 'JSON malformado en el cuerpo de la petición' })
      }
    }

    const { file, filename, mimetype } = data || {}

    if (!file || !filename || !mimetype) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (file, filename, mimetype)' })
    }

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
    if (!allowed.includes(mimetype)) {
      return res.status(400).json({ error: 'Tipo de archivo no soportado. Solo imágenes y videos.' })
    }

    // Convert Base64 back to raw binary Buffer
    const buffer = Buffer.from(file, 'base64')

    // Define standard public bucket name
    const bucketName = 'media-gallery'

    // Ensure the bucket exists and is public (runs on backend with admin privileges)
    try {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024 // 20MB limit
      })
    } catch (bucketErr) {
      // Bucket might already exist, which is the expected case
    }

    // Upload the file buffer to Supabase Storage
    const uniqueName = `${Date.now()}_${filename.replace(/\s+/g, '_')}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(uniqueName, buffer, {
        contentType: mimetype,
        upsert: true
      })

    if (uploadError) {
      console.error('Error al subir a Supabase Storage:', uploadError)
      throw new Error(`Supabase Storage falló: ${uploadError.message}`)
    }

    // Retrieve the permanent direct public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(uniqueName)

    const fileSizeKB = buffer.length / 1024
    const fileSizeStr = fileSizeKB >= 1024
      ? (fileSizeKB / 1024).toFixed(1) + ' MB'
      : Math.round(fileSizeKB) + ' KB'

    res.json({
      url: publicUrl,
      originalName: filename,
      size: fileSizeStr,
      mimeType: mimetype
    })

  } catch (err) {
    console.error('Error al subir archivo:', err)
    res.status(500).json({ error: err.message || 'Error interno al subir el archivo' })
  }
})

export default router
