import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import messagesRouter from './routes/messages.js'
import agentsRouter from './routes/agents.js'
import contactsRouter from './routes/contacts.js'
import uploadRouter from './routes/upload.js'
import botRouter from './routes/bot.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.text({ type: ['application/json', 'text/plain'], limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/messages', messagesRouter)
app.use('/api/agents', agentsRouter)
app.use('/api/contacts', contactsRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/bot', botRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), project: 'Betel Bouttique Soft' })
})

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Betel Express server running on port ${PORT}`)
  })
}

export default app
