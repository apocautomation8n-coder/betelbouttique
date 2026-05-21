import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function SupplierForm({ supplier, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    cuit: supplier?.cuit || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    payment_terms: supplier?.payment_terms || '',
    notes: supplier?.notes || '',
    is_active: supplier?.is_active ?? true,
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input label="Nombre / Razón Social" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Textiles del Sur SRL" required />
        </div>
        <Input label="CUIT" value={form.cuit} onChange={e => set('cuit', e.target.value)} placeholder="30-12345678-9" />
        <Input label="Teléfono" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+54 11 1234-5678" />
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@ejemplo.com" />
        <Input label="Ciudad" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Buenos Aires" />
        <div className="md:col-span-2">
          <Input label="Dirección" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Av. Corrientes 1234" />
        </div>
        <div className="md:col-span-2">
          <Input label="Condiciones de pago" value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} placeholder="50% anticipo, 50% contra entrega" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observaciones..." rows={3}
            className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder-primary-300 text-primary-600 resize-none" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>{supplier ? 'Actualizar' : 'Crear Proveedor'}</Button>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
