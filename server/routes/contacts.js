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

export default router
