import express from 'express'
import FormData from 'form-data'
import https from 'https'

const router = express.Router()

// POST /api/upload — Upload a base64 encoded file to catbox.moe
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

    // Build standard npm form-data payload
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, {
      filename: filename,
      contentType: mimetype
    })

    const options = {
      hostname: 'catbox.moe',
      path: '/user/api.php',
      method: 'POST',
      headers: form.getHeaders()
    }

    // Use native Node https stream request to guarantee compatibility with all serverless setups
    const request = https.request(options, (response) => {
      let body = ''
      response.on('data', (chunk) => {
        body += chunk
      })
      response.on('end', () => {
        const url = body.trim()
        if (response.statusCode === 200 && url.startsWith('http')) {
          const fileSizeKB = buffer.length / 1024
          const fileSizeStr = fileSizeKB >= 1024
            ? (fileSizeKB / 1024).toFixed(1) + ' MB'
            : Math.round(fileSizeKB) + ' KB'

          res.json({
            url,
            originalName: filename,
            size: fileSizeStr,
            mimeType: mimetype
          })
        } else {
          console.error('Error de subida externa. Status:', response.statusCode, 'Body:', url)
          res.status(500).json({ error: 'El servidor externo falló con respuesta: ' + url })
        }
      })
    })

    request.on('error', (err) => {
      console.error('Error de red en https request:', err)
      res.status(500).json({ error: 'Error de red con el host externo: ' + err.message })
    })

    // Write form buffer to request stream
    request.write(form.getBuffer())
    request.end()

  } catch (err) {
    console.error('Error al subir archivo:', err)
    res.status(500).json({ error: err.message || 'Error interno al subir el archivo' })
  }
})

export default router
