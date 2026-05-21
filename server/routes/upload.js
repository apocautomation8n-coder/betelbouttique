import express from 'express'
import multer from 'multer'

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

// POST /api/upload — Upload a file to catbox.moe and return a permanent URL
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' })
    }

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype })

    const formData = new FormData()
    formData.append('reqtype', 'fileupload')
    formData.append('fileToUpload', blob, req.file.originalname)

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Catbox respondió con estado ${response.status}`)
    }

    const url = (await response.text()).trim()

    if (!url.startsWith('http')) {
      throw new Error('Respuesta inesperada de catbox: ' + url)
    }

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
  } catch (err) {
    console.error('Error al subir archivo:', err)
    res.status(500).json({ error: err.message || 'Error interno al subir el archivo' })
  }
})

export default router
