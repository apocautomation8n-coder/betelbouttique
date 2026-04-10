import { useState } from 'react'
import { useLabels } from '../../hooks/useMessages'
import { Plus, Trash2, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

export default function LabelManager({ isOpen, onClose }) {
  const { labels, loading, addLabel, deleteLabel } = useLabels()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3d3b3a')

  const handleAdd = async () => {
    if (!newName.trim()) return
    const { error } = await addLabel(newName.trim(), newColor)
    if (error) {
      toast.error('Error al crear etiqueta')
    } else {
      toast.success('Etiqueta creada')
      setNewName('')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Etiquetas">
      <div className="space-y-6">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input 
              label="Nueva Etiqueta" 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre..."
            />
          </div>
          <input 
            type="color" 
            value={newColor} 
            onChange={e => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0 overflow-hidden"
          />
          <Button onClick={handleAdd}>CREAR</Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {loading ? (
            <p className="text-center text-xs text-primary-400">Cargando...</p>
          ) : labels.length === 0 ? (
            <p className="text-center text-xs text-primary-400">No hay etiquetas creadas.</p>
          ) : (
            labels.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-primary-50 rounded-xl border border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-sm font-bold text-primary-600 uppercase tracking-tight">{l.name}</span>
                </div>
                <button 
                  onClick={() => deleteLabel(l.id)}
                  className="p-1.5 text-primary-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
