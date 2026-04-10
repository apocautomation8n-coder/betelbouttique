import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, CheckCheck, Trash2 } from 'lucide-react'

export default function ConversationList({ conversations, selectedContactId, onSelect, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-primary-400 font-secondary">
        <p className="text-sm uppercase tracking-widest">No hay conversaciones</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-primary-100/50">
      {conversations.map((conv) => {
        const isSelected = selectedContactId === conv.contact.id
        const date = new Date(conv.lastTimestamp)
        
        return (
          <div
            key={conv.contact.id}
            onClick={() => onSelect(conv.contact)}
            className={`
              relative p-4 cursor-pointer transition-all duration-200 group
              ${isSelected ? 'bg-primary-100' : 'hover:bg-primary-50'}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white border border-primary-200 flex items-center justify-center text-primary-600 font-bold shadow-sm">
                  {(conv.contact.name || '?')[0].toUpperCase()}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {conv.unreadCount}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-sm truncate uppercase tracking-tight ${isSelected ? 'text-primary-600' : 'text-primary-700'}`}>
                    {conv.contact.name || conv.contact.phone}
                  </h3>
                  <span className="text-[10px] text-primary-400 font-secondary shrink-0">
                    {format(date, 'HH:mm', { locale: es })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-primary-900 font-bold' : 'text-primary-400'}`}>
                    {conv.lastDirection === 'outbound' && (
                      <span className="mr-1 text-primary-400">
                        <CheckCheck size={14} className="inline" />
                      </span>
                    )}
                    {conv.lastMessage}
                  </p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conv.contact.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-primary-300 hover:text-red-500 transition-all rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600" />
            )}
          </div>
        )
      })}
    </div>
  )
}
