import { Router } from 'express'
import supabase from '../supabaseAdmin.js'
import { normalizePhone, sendSuccess, sendError } from '../utils.js'

const router = Router()

// GET /api/agents/status?phone=...
router.get('/status', async (req, res) => {
  try {
    const phone = normalizePhone(req.query.phone)
    if (!phone) return sendError(res, 'phone is required', 400)

    const { data: contact, error } = await supabase
      .from('contacts')
      .select('bot_enabled')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Contact not found -> Bot is enabled by default for new leads
        return sendSuccess(res, { bot_enabled: true })
      }
      throw error
    }

    return sendSuccess(res, { bot_enabled: contact.bot_enabled })
  } catch (err) {
    return sendError(res, err)
  }
})

export default router
