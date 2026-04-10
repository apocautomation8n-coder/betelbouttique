import { useState } from 'react'
import { useContacts } from '../hooks/useMessages'
import { Search, Plus, Mail, Phone, User, MoreVertical, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function Contacts() {
  const { contacts, loading, refetch } = useContacts()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  )

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('contacts').insert([newContact])
      if (error) throw error
      toast.success('Contacto creado')
      setShowAddModal(false)
      setNewContact({ name: '', phone: '', email: '' })
      refetch()
    } catch (err) {
      toast.error('Error al crear contacto: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
      toast.success('Contacto eliminado')
      refetch()
    } catch (err) {
      toast.error('Error al eliminar contacto')
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl text-primary-600 uppercase tracking-wider">Contactos</h1>
          <p className="text-primary-500 font-secondary text-sm tracking-widest uppercase mt-1">Gestión de Leads</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 w-full md:w-64 transition-all"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            NUEVO
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary-50 border-b border-primary-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary">Teléfono</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary flex justify-end">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-primary-400 font-secondary text-sm">
                    No se encontraron contactos.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(c => (
                  <tr key={c.id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                          {(c.name || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-primary-600">{c.name || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-primary-500">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-primary-500">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-primary-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nuevo Contacto">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input 
            label="Nombre" 
            required 
            value={newContact.name}
            onChange={e => setNewContact({...newContact, name: e.target.value})}
            placeholder="ej: Juan Pérez"
          />
          <Input 
            label="Teléfono" 
            required 
            value={newContact.phone}
            onChange={e => setNewContact({...newContact, phone: e.target.value})}
            placeholder="ej: +549..."
          />
          <Input 
            label="Email" 
            type="email"
            value={newContact.email}
            onChange={e => setNewContact({...newContact, email: e.target.value})}
            placeholder="ej: juan@gmail.com"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-primary-100">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>CANCELAR</Button>
            <Button type="submit" loading={submitting}>GUARDAR</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
