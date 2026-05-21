import express from 'express'
import multer from 'multer'
import FormData from 'form-data'
import https from 'https'

const router = express.Router()

// Store files in memory (no disk usage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo imágenes y videos.'), false)
    }
  }
})

// POST /api/upload — Upload a file to catbox.moe using Node's native https module for absolute serverless compatibility
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' })
    }

    // Build standard npm form-data payload
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
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
          const fileSizeKB = req.file.size / 1024
          const fileSizeStr = fileSizeKB >= 1024
            ? (fileSizeKB / 1024).toFixed(1) + ' MB'
            : Math.round(fileSizeKB) + ' KB'

          res.json({
            url,
            originalName: req.file.originalname,
            size: fileSizeStr,
            mimeType: req.file.mimetype
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
