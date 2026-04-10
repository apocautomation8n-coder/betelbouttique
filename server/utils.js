export function normalizePhone(phone) {
  if (!phone) return ''
  let clean = phone.toString().replace(/[^\d+]/g, '')
  if (clean && !clean.startsWith('+')) {
    clean = '+' + clean
  }
  if (clean.startsWith('+549')) {
    return '+54' + clean.slice(4)
  }
  return clean
}

export function sendSuccess(res, data = {}) {
  return res.json({ success: true, ...data })
}

export function sendError(res, error, status = 500) {
  console.error('Server error:', error)
  return res.status(status).json({ 
    success: false, 
    error: typeof error === 'string' ? error : (error.message || 'Internal Server Error')
  })
}

/**
 * Handles potential malformed JSON from n8n webhooks.
 * Sometimes n8n sends raw text or mismatched content-types.
 */
export function laxParse(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch (e) {
      console.warn('Failed to parse body as JSON, returning raw string', e)
      return { raw: body }
    }
  }
  return body
}
