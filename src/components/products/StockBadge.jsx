export default function StockBadge({ stock, minStock = 2 }) {
  let bg, text, label

  if (stock === 0) {
    bg = 'bg-red-100'
    text = 'text-red-700'
    label = 'Agotado'
  } else if (stock <= minStock) {
    bg = 'bg-amber-100'
    text = 'text-amber-700'
    label = `Bajo (${stock})`
  } else {
    bg = 'bg-emerald-100'
    text = 'text-emerald-700'
    label = stock
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  )
}
