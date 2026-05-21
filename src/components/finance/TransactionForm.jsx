import { useState } from 'react'
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

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const filtered = categories?.filter(c => c.type === type) || []

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount), date: new Date(form.date).toISOString() }) }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Monto (ARS $)" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Fecha</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Categoría</label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600">
            <option value="">Seleccionar...</option>
            {filtered.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Medio de pago</label>
          <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600">
            {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        {type === 'expense' && suppliers && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Proveedor (opc)</label>
            <select value={form.supplier_id} onChange={e => set('supplier_id', e.target.value || null)}
              className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600">
              <option value="">Ninguno</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <Input label="Referencia / Nro" value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="Nro factura, recibo..." />
        <div className="md:col-span-2">
          <Input label="Descripción" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detalle de la transacción..." />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>{type === 'income' ? '💰 Registrar Ingreso' : '📦 Registrar Egreso'}</Button>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
