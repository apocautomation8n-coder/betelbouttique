import { Package, Edit2, Trash2 } from 'lucide-react'
import { formatARS, calcMargin } from '../../lib/formatters'
import StockBadge from './StockBadge'

export default function ProductCard({ product, onEdit, onDelete }) {
  const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0
  const hasLowStock = product.variants?.some(v => v.stock <= (v.min_stock || 2))
  const margin = calcMargin(product.cost_price, product.sell_price)

  const statusStyles = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-500',
    out_of_stock: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    out_of_stock: 'Agotado',
  }

  return (
    <div className="bg-white rounded-2xl border border-primary-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Imagen / Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary-300">
            <Package size={40} strokeWidth={1.5} />
            <span className="text-xs font-secondary uppercase tracking-wider">Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusStyles[product.status]}`}>
            {statusLabels[product.status]}
          </span>
          {product.category && (
            <span className="text-[10px] font-bold bg-white/90 text-primary-600 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {product.category.icon} {product.category.name}
            </span>
          )}
        </div>

        {/* Low stock alert */}
        {hasLowStock && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            ⚠️ Stock bajo
          </div>
        )}

        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onEdit(product)}
            className="p-2.5 bg-white rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2.5 bg-white rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300 delay-75"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-primary-700 text-sm leading-snug line-clamp-2 mb-1">{product.name}</h3>
        {product.sku && (
          <p className="text-[10px] font-mono text-primary-400 mb-2">SKU: {product.sku}</p>
        )}

        {/* Precios */}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-lg font-bold text-primary-800">{formatARS(product.sell_price)}</span>
          {margin > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +{margin.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Variantes */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map(v => (
              <div key={v.id} className="flex items-center gap-1.5 text-[10px] bg-primary-50 border border-primary-100 rounded-lg px-2 py-0.5">
                <span className="font-bold text-primary-600">
                  {v.size}{v.color ? ` - ${v.color}` : ''}
                </span>
                <span className="text-primary-300">|</span>
                <StockBadge stock={v.stock} minStock={v.min_stock} />
              </div>
            ))}
          </div>
        )}

        {/* Total Stock */}
        <div className="mt-3 pt-3 border-t border-primary-50 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-primary-400 font-secondary">Stock total</span>
          <span className={`text-sm font-bold ${totalStock === 0 ? 'text-red-500' : totalStock <= 5 ? 'text-amber-600' : 'text-primary-700'}`}>
            {totalStock} un.
          </span>
        </div>
      </div>
    </div>
  )
}
