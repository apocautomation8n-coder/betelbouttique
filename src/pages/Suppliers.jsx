import { useState } from 'react'
import { Plus, Search, Truck, Phone, Mail, MapPin, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/useSuppliers'
import SupplierForm from '../components/suppliers/SupplierForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

export default function Suppliers() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const { data: suppliers, isLoading } = useSuppliers(search)
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const handleSubmit = async (data) => {
    if (editing) {
      await updateSupplier.mutateAsync({ id: editing.id, ...data })
    } else {
      await createSupplier.mutateAsync(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este proveedor?')) {
      await deleteSupplier.mutateAsync(id)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Proveedores</h1>
          <p className="text-sm text-primary-400 font-secondary mt-1">{suppliers?.length || 0} proveedores</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={18} /> Nuevo Proveedor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o CUIT..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder-primary-300 text-primary-600" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suppliers?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary-300">
          <Truck size={48} strokeWidth={1.5} />
          <p className="mt-3 font-secondary text-sm">No hay proveedores</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}><Plus size={16} /> Agregar</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${s.is_active ? 'bg-primary-600 text-primary-100' : 'bg-gray-200 text-gray-400'}`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-primary-700 text-sm truncate">{s.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-primary-400 font-secondary">
                    {s.cuit && <span>CUIT: {s.cuit}</span>}
                    {s.city && <span className="flex items-center gap-1"><MapPin size={10} />{s.city}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button onClick={e => { e.stopPropagation(); setEditing(s); setShowForm(true) }}
                    className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(s.id) }}
                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                  {expanded === s.id ? <ChevronUp size={16} className="text-primary-400" /> : <ChevronDown size={16} className="text-primary-300" />}
                </div>
              </div>

              {expanded === s.id && (
                <div className="px-5 pb-5 pt-0 border-t border-primary-50 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-xs text-primary-500 hover:text-primary-700 bg-primary-50 rounded-lg px-3 py-2">
                        <Phone size={14} /> {s.phone}
                      </a>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-xs text-primary-500 hover:text-primary-700 bg-primary-50 rounded-lg px-3 py-2">
                        <Mail size={14} /> {s.email}
                      </a>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-2 text-xs text-primary-500 bg-primary-50 rounded-lg px-3 py-2">
                        <MapPin size={14} /> {s.address}
                      </div>
                    )}
                  </div>
                  {s.payment_terms && (
                    <div className="mt-3 text-xs text-primary-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      <span className="font-bold text-amber-700">Condiciones:</span> {s.payment_terms}
                    </div>
                  )}
                  {s.notes && (
                    <p className="mt-2 text-xs text-primary-400 italic">{s.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null) }} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'} size="lg">
        <SupplierForm supplier={editing} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null) }}
          loading={createSupplier.isPending || updateSupplier.isPending} />
      </Modal>
    </div>
  )
}
