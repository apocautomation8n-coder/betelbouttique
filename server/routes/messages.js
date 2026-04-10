import { Router } from 'express'
import supabase from '../supabaseAdmin.js'
import { normalizePhone, sendSuccess, sendError, laxParse } from '../utils.js'

const router = Router()

// POST /api/messages/inbound
router.post('/inbound', async (req, res) => {
  try {
    const body = laxParse(req.body)
    const { name, phone, timestamp, message, agent_slug } = body
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !agent_slug) {
      return sendError(res, 'phone and agent_slug are required', 400)
    }

    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .upsert({ phone: normalizedPhone, name: name || null }, { onConflict: 'phone' })
      .select('id')
      .single()

    if (contactErr || !contact) throw contactErr || new Error('Contact handle failed')

    const { data: agent, error: agentErr } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', agent_slug)
      .single()

    if (agentErr || !agent) return sendError(res, `Agent '${agent_slug}' not found`, 404)

    await supabase.from('messages').insert({
      agent_id: agent.id,
      contact_id: contact.id,
      direction: 'inbound',
      content: message || '',
      media_type: 'text',
      timestamp: timestamp || new Date().toISOString(),
      is_read: false,
    })

    return sendSuccess(res)
  } catch (err) {
    return sendError(res, err)
  }
})

// POST /api/messages/bot-outbound
router.post('/bot-outbound', async (req, res) => {
  try {
    const body = laxParse(req.body)
    const { phone, message, agent_slug, timestamp } = body
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !agent_slug) {
      return sendError(res, 'phone and agent_slug are required', 400)
    }

    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .upsert({ phone: normalizedPhone }, { onConflict: 'phone' })
      .select('id')
      .single()

    if (contactErr || !contact) throw contactErr || new Error('Contact handle failed')

    const { data: agent, error: agentErr } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', agent_slug)
      .single()

    if (agentErr || !agent) return sendError(res, `Agent '${agent_slug}' not found`, 404)

    await supabase.from('messages').insert({
      agent_id: agent.id,
      contact_id: contact.id,
      direction: 'outbound',
      content: message || '',
      media_type: 'text',
      is_read: true,
      timestamp: timestamp || new Date().toISOString(),
    })

    return sendSuccess(res)
  } catch (err) {
    return sendError(res, err)
  }
})

export default router
