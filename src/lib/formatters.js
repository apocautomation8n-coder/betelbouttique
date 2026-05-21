/**
 * Formateadores para Betel Boutique — Argentina (ARS)
 */

/**
 * Formatea un número como moneda argentina (ARS)
 * @param {number} amount 
 * @returns {string} Ej: "$ 12.500,00"
 */
export function formatARS(amount) {
  if (amount == null || isNaN(amount)) return '$ 0,00'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea un número como moneda compacta (sin decimales)
 * @param {number} amount 
 * @returns {string} Ej: "$ 12.500"
 */
export function formatARSCompact(amount) {
  if (amount == null || isNaN(amount)) return '$ 0'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calcula el margen de ganancia
 * @param {number} cost 
 * @param {number} sell 
 * @returns {number} Porcentaje de margen
 */
export function calcMargin(cost, sell) {
  if (!cost || !sell || cost === 0) return 0
  return ((sell - cost) / cost * 100)
}

/**
 * Formatea una fecha en formato argentino
 * @param {string|Date} date 
 * @returns {string} Ej: "21/05/2026"
 */
export function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

/**
 * Formatea fecha con hora
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

/**
 * Nombre del mes actual
 * @param {number} monthIndex 0-indexed
 * @returns {string}
 */
export function getMonthName(monthIndex) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[monthIndex] || ''
}

/**
 * Devuelve primer y último día del mes
 * @param {number} year 
 * @param {number} month 0-indexed
 * @returns {{ start: string, end: string }}
 */
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1).toISOString()
  const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
  return { start, end }
}

/**
 * Genera un SKU automático
 * @param {string} categoryPrefix 
 * @param {number} index 
 * @returns {string}
 */
export function generateSKU(categoryPrefix, index) {
  const prefix = (categoryPrefix || 'PRD').substring(0, 3).toUpperCase()
  const num = String(index).padStart(4, '0')
  return `${prefix}-${num}`
}
