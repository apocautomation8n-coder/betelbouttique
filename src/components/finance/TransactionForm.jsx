import { useState, useEffect } from 'react'
import { useProducts } from '../../hooks/useProducts'
import Input from '../ui/Input'
import Button from '../ui/Button'

const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 Efectivo' },
  { value: 'transfer', label: '🏦 Transferencia' },
  { value: 'card', label: '💳 Tarjeta' },
  { value: 'mercadopago', label: '📱 MercadoPago' },
  { value: 'other', label: '📋 Otro' },
]

export default function TransactionForm({ type, categories, suppliers, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    type,
    amount: '',
    description: '',
    category_id: '',
    supplier_id: '',
    payment_method: 'cash',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Product linkage states for income
  const [linkProduct, setLinkProduct] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const { data: products } = useProducts({ status: 'active' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const filtered = categories?.filter(c => c.type === type) || []

  // Check if selected category is a Sale
  const selectedCategory = categories?.find(c => c.id === form.category_id)
  const isSale = selectedCategory?.name?.toLowerCase().includes('venta')

  // Auto-enable product linkage when "Ventas" category is chosen
  useEffect(() => {
    if (isSale) {
      setLinkProduct(true)
    } else {
      setLinkProduct(false)
    }
  }, [form.category_id, isSale])

  // Get variants for the selected product
  const selectedProduct = products?.find(p => p.id === selectedProductId)
  const productVariants = selectedProduct?.variants || []

  // Event handlers for auto calculations
  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId)
    setSelectedVariantId('')
    const prod = products?.find(p => p.id === prodId)
    if (prod) {
      set('amount', (prod.sell_price * quantity).toString())
      set('description', `Venta: ${prod.name} x${quantity} un.`)
    } else {
      set('amount', '')
      set('description', '')
    }
  }

  const handleVariantChange = (varId) => {
    setSelectedVariantId(varId)
    const variant = productVariants.find(v => v.id === varId)
    if (selectedProduct && variant) {
      set('description', `Venta: ${selectedProduct.name} (${variant.size}${variant.color ? ` - ${variant.color}` : ''}) x${quantity} un.`)
    }
  }

  const handleQuantityChange = (qty) => {
    const numQty = Math.max(1, Number(qty) || 1)
    setQuantity(numQty)
    if (selectedProduct) {
      set('amount', (selectedProduct.sell_price * numQty).toString())
      const variant = productVariants.find(v => v.id === selectedVariantId)
      if (variant) {
        set('description', `Venta: ${selectedProduct.name} (${variant.size}${variant.color ? ` - ${variant.color}` : ''}) x${numQty} un.`)
      } else {
        set('description', `Venta: ${selectedProduct.name} x${numQty} un.`)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      transaction: {
        category_id: form.category_id || null,
        supplier_id: form.supplier_id || null,
        type: form.type,
        amount: Number(form.amount) || 0,
        description: form.description || null,
        payment_method: form.payment_method,
        reference: form.reference || null,
        date: new Date(form.date).toISOString(),
      },
      variantStockUpdate: linkProduct && selectedVariantId ? {
        variantId: selectedVariantId,
        quantity: Number(quantity)
      } : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Monto (ARS $)" 
          type="number" 
          step="0.01" 
          value={form.amount} 
          onChange={e => set('amount', e.target.value)} 
          placeholder="0.00" 
          required 
        />
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Fecha</label>
          <input 
            type="date" 
            value={form.date} 
            onChange={e => set('date', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Categoría</label>
          <select 
            value={form.category_id} 
            onChange={e => set('category_id', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
            required
          >
            <option value="">Seleccionar...</option>
            {filtered.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Medio de pago</label>
          <select 
            value={form.payment_method} 
            onChange={e => set('payment_method', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
          >
            {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {type === 'expense' && suppliers && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Proveedor (opc)</label>
            <select 
              value={form.supplier_id} 
              onChange={e => set('supplier_id', e.target.value || null)}
              className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
            >
              <option value="">Ninguno</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <Input 
          label="Referencia / Nro" 
          value={form.reference} 
          onChange={e => set('reference', e.target.value)} 
          placeholder="Nro factura, recibo..." 
        />

        {/* Product link section for income/sales */}
        {type === 'income' && (
          <div className="md:col-span-2 border-t border-primary-100 pt-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={linkProduct}
                onChange={e => setLinkProduct(e.target.checked)}
                className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                📉 Descontar de stock de un Producto / Talle / Color
              </span>
            </label>

            {linkProduct && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Producto</label>
                  <select
                    value={selectedProductId}
                    onChange={e => handleProductChange(e.target.value)}
                    required={linkProduct}
                    className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 font-bold"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Talle & Color</label>
                  <select
                    value={selectedVariantId}
                    onChange={e => handleVariantChange(e.target.value)}
                    required={linkProduct && selectedProductId}
                    disabled={!selectedProductId}
                    className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
                  >
                    <option value="">Seleccionar variante...</option>
                    {productVariants.map(v => (
                      <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                        {v.size} {v.color ? `- ${v.color}` : ''} (Stock: {v.stock}) {v.stock <= 0 ? '— ¡SIN STOCK!' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    label="Cantidad Vendida"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => handleQuantityChange(e.target.value)}
                    required={linkProduct}
                    disabled={!selectedProductId}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="md:col-span-2">
          <Input 
            label="Descripción / Detalle" 
            value={form.description} 
            onChange={e => set('description', e.target.value)} 
            placeholder="Detalle de la transacción..." 
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>{type === 'income' ? '💰 Registrar Ingreso' : '📦 Registrar Egreso'}</Button>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
