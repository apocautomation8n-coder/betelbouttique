import { useState } from 'react'
import { User, Phone, Mail, Calendar, Bot, Tag, X, ChevronRight } from 'lucide-react'
import { useLabels, addLabelToContact, removeLabelFromContact } from '../../hooks/useMessages'
import Toggle from '../ui/Toggle'
import toast from 'react-hot-toast'

export default function ContactPanel({ contact, onClose, onToggleBot }) {
  const { labels } = useLabels()
  const [isAddingLabel, setIsAddingLabel] = useState(false)

  const handleAddLabel = async (labelId) => {
    const { error } = await addLabelToContact(contact.id, labelId)
    if (error) {
      if (error.code === '23505') toast.error('Ya tiene esta etiqueta')
    } else {
      toast.success('Etiqueta añadida')
      // Refetch is handled by the parent refreshing the conversations/contact data
    }
    setIsAddingLabel(false)
  }

  const handleRemoveLabel = async (labelId) => {
    await removeLabelFromContact(contact.id, labelId)
    toast.success('Etiqueta eliminada')
  }

  return (
    <div className="w-80 bg-white border-l border-primary-100 flex flex-col shrink-0 overflow-y-auto animate-slide-right shadow-xl z-20">
      <div className="p-6 border-b border-primary-100 flex items-center justify-between">
        <h3 className="font-title text-xl text-primary-600 uppercase tracking-widest">Detalle</h3>
        <button onClick={onClose} className="p-2 text-primary-400 hover:text-primary-600 rounded-lg">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Profile Card */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-3xl mx-auto mb-4 border-2 border-primary-200">
            {(contact.name || '?')[0].toUpperCase()}
          </div>
          <h4 className="font-bold text-lg text-primary-600 uppercase tracking-tight truncate px-2">
            {contact.name || 'Sin nombre'}
          </h4>
          <span className="text-xs text-primary-400 font-secondary uppercase tracking-widest">Lead en curso</span>
        </div>

        {/* Info List */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-primary-500">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-400 shrink-0">
              <Phone size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Teléfono</p>
              <p className="text-sm font-mono truncate">{contact.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-primary-500">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-400 shrink-0">
              <Mail size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email</p>
              <p className="text-sm truncate">{contact.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Labels Section */}
        <div className="space-y-4 pt-6 border-t border-primary-100">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-primary-400">Etiquetas</h5>
            <button 
              onClick={() => setIsAddingLabel(!isAddingLabel)}
              className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-all"
            >
              <Tag size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {contact.labels?.map(l => (
              <span 
                key={l.id} 
                className="group relative px-3 py-1 text-[10px] font-bold text-white rounded-full flex items-center gap-1 shadow-sm"
                style={{ backgroundColor: l.color }}
              >
                {l.name}
                <button onClick={() => handleRemoveLabel(l.id)} className="hover:text-black/50">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          {isAddingLabel && (
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 space-y-2 animate-fade-in">
              <p className="text-[10px] font-bold text-primary-500 uppercase">Seleccionar:</p>
              <div className="flex flex-wrap gap-2">
                {labels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleAddLabel(l.id)}
                    className="px-2 py-1 text-[10px] font-bold border rounded-full hover:bg-white transition-all"
                    style={{ borderColor: l.color, color: l.color }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assistant status */}
        <div className="pt-6 border-t border-primary-100">
          <div className="p-4 bg-primary-100/50 rounded-2xl border border-primary-100">
            <Toggle 
              enabled={contact.bot_enabled} 
              onChange={(val) => onToggleBot(contact.id, val)}
              label="Asistente IA Activo"
            />
            <p className="text-[10px] text-primary-400 mt-2 font-secondary leading-relaxed uppercase tracking-tighter">
              {contact.bot_enabled 
                ? "El bot responderá automáticamente los mensajes entrantes." 
                : "Control manual. El bot no intervendrá en esta charla."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
