import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Único']

export default function ProductForm({ product, categories, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    sku: product?.sku || '',
    image_url: product?.image_url || '',
    cost_price: product?.cost_price || '',
    sell_price: product?.sell_price || '',
    status: product?.status || 'active',
  })

  const [variants, setVariants] = useState(
    product?.variants?.map(v => ({ size: v.size, color: v.color || '', stock: v.stock, min_stock: v.min_stock || 2 })) ||
    [{ size: 'M', color: '', stock: 0, min_stock: 2 }]
  )

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { size: 'M', color: '', stock: 0, min_stock: 2 }])
  }

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const margin = form.cost_price && form.sell_price
    ? (((form.sell_price - form.cost_price) / form.cost_price) * 100).toFixed(1)
    : null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      product: {
        ...form,
        cost_price: Number(form.cost_price) || 0,
        sell_price: Number(form.sell_price) || 0,
      },
      variants: variants.map(v => ({
        size: v.size,
        color: v.color || null,
        stock: Number(v.stock) || 0,
        min_stock: Number(v.min_stock) || 2,
      }))
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Nombre del producto"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Ej: Remera 'Fe' Oversize"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">
            Categoría
          </label>
          <select
            value={form.category_id}
            onChange={e => handleChange('category_id', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-primary-600"
          >
            <option value="">Sin categoría</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="SKU"
          value={form.sku}
          onChange={e => handleChange('sku', e.target.value)}
          placeholder="Ej: REM-0001"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">
          Descripción
        </label>
        <textarea
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="Descripción del producto..."
          rows={3}
          className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent placeholder-primary-300 text-primary-600 resize-none"
        />
      </div>

      <Input
        label="URL de imagen"
        value={form.image_url}
        onChange={e => handleChange('image_url', e.target.value)}
        placeholder="https://..."
      />

      {/* Precios */}
      <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
        <h4 className="font-title text-lg uppercase tracking-wider text-primary-600 mb-3">Precios (ARS $)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio costo"
            type="number"
            step="0.01"
            value={form.cost_price}
            onChange={e => handleChange('cost_price', e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Precio venta"
            type="number"
            step="0.01"
            value={form.sell_price}
            onChange={e => handleChange('sell_price', e.target.value)}
            placeholder="0.00"
          />
          <div className="flex items-end">
            <div className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold text-center ${
              margin && margin > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              margin && margin <= 0 ? 'bg-red-50 text-red-600 border border-red-200' :
              'bg-primary-50 text-primary-400 border border-primary-200'
            }`}>
              Margen: {margin ? `${margin}%` : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Variantes / Talles */}
      <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-title text-lg uppercase tracking-wider text-primary-600">Talles & Stock</h4>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
          >
            <Plus size={14} /> Agregar talle
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-primary-100">
              <select
                value={v.size}
                onChange={e => updateVariant(i, 'size', e.target.value)}
                className="px-3 py-2 bg-white border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 font-bold"
              >
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                value={v.color}
                onChange={e => updateVariant(i, 'color', e.target.value)}
                placeholder="Color (opc)"
                className="flex-1 px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
              />
              <input
                type="number"
                value={v.stock}
                onChange={e => updateVariant(i, 'stock', e.target.value)}
                placeholder="Stock"
                className="w-20 px-3 py-2 border border-primary-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 font-bold"
              />
              <input
                type="number"
                value={v.min_stock}
                onChange={e => updateVariant(i, 'min_stock', e.target.value)}
                placeholder="Mín"
                className="w-16 px-3 py-2 border border-primary-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-400"
                title="Stock mínimo (alerta)"
              />
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">
          Estado
        </label>
        <select
          value={form.status}
          onChange={e => handleChange('status', e.target.value)}
          className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-primary-600"
        >
          <option value="active">✅ Activo</option>
          <option value="inactive">⏸️ Inactivo</option>
          <option value="out_of_stock">❌ Agotado</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {product ? 'Actualizar' : 'Crear Producto'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
