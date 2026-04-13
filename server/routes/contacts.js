import { Router } from 'express'
import supabase from '../supabaseAdmin.js'
import { normalizePhone, sendSuccess, sendError, laxParse } from '../utils.js'

const router = Router()

// GET /api/contacts/check/:phone
router.get('/check/:phone', async (req, res) => {
  try {
    const phone = normalizePhone(req.params.phone)
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, bot_enabled')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return sendSuccess(res, { exists: !!data, contact: data || null })
  } catch (err) {
    return sendError(res, err)
  }
})

// GET /api/contacts/check-conversation/:phone
router.get('/check-conversation/:phone', async (req, res) => {
  try {
    const normalizedPhone = normalizePhone(req.params.phone)

    const { data: contact } = await supabase
      .from('contacts')
      .select('id, bot_enabled')
      .eq('phone', normalizedPhone)
      .single()

    if (!contact) {
      return sendSuccess(res, { exists: false, hasMessages: false })
    }

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('contact_id', contact.id)

    return sendSuccess(res, {
      exists: true,
      hasMessages: (count || 0) > 0,
      contactId: contact.id,
      bot_enabled: contact.bot_enabled
    })
  } catch (err) {
    return sendError(res, err)
  }
})

// POST /api/contacts/open-conversation
router.post('/open-conversation', async (req, res) => {
  try {
    const { phone, name } = laxParse(req.body)
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
      return sendError(res, 'phone is required', 400)
    }

    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .upsert(
        { phone: normalizedPhone, name: name || null, bot_enabled: true },
        { onConflict: 'phone' }
      )
      .select('id')
      .single()

    if (contactErr) throw contactErr

    return sendSuccess(res, { contactId: contact.id })
  } catch (err) {
    return sendError(res, err)
  }
})

// POST /api/contacts
router.post('/', async (req, res) => {
  try {
    const { phone, name, email } = laxParse(req.body)
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) return sendError(res, 'Phone is required', 400)

    const { data, error } = await supabase
      .from('contacts')
      .upsert({ phone: normalizedPhone, name: name || null, email: email || null }, { onConflict: 'phone' })
      .select()
      .single()

    if (error) throw error
    return sendSuccess(res, { contact: data })
  } catch (err) {
    return sendError(res, err)
  }
})

// POST /api/contacts/toggle-bot
router.post('/toggle-bot', async (req, res) => {
  try {
    const { phone, bot_enabled } = laxParse(req.body)
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) return sendError(res, 'Phone is required', 400)
    
    if (typeof bot_enabled !== 'boolean' && bot_enabled !== 'true' && bot_enabled !== 'false') {
      return sendError(res, 'bot_enabled must be a boolean', 400)
    }

    const isEnabled = bot_enabled === true || bot_enabled === 'true'

    const { data, error } = await supabase
      .from('contacts')
      .update({ bot_enabled: isEnabled })
      .eq('phone', normalizedPhone)
      .select('id, phone, bot_enabled')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return sendError(res, 'Contact not found', 404)
      }
      throw error
    }

    return sendSuccess(res, { contact: data })
  } catch (err) {
    return sendError(res, err)
  }
})

export default router
