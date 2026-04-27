import { useState, useEffect, useRef } from 'react'
import { useMessages, sendOutboundMessage, uploadAudio, reopenConversation } from '../../hooks/useMessages'
import { useRealtime } from '../../hooks/useRealtime'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import Toggle from '../ui/Toggle'
import { ArrowLeft, Bot, Phone, MoreVertical, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatWindow({ agent, contact, onToggleBot, onBack, onOpenDetails }) {
  const { messages, loading, refetch, addMessage } = useMessages(agent?.id, contact?.id)
  const scrollRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Realtime subscription for new messages in this specific conversation
  useRealtime('messages', `agent_id=eq.${agent?.id},contact_id=eq.${contact?.id}`, (payload) => {
    if (payload.eventType === 'INSERT') {
      addMessage(payload.new)
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setMenuOpen(false)
  }, [contact?.id])

  const handleSendText = async (text) => {
    try {
      await sendOutboundMessage({
        phone: contact.phone,
        agentSlug: agent.slug,
        agentId: agent.id,
        contactId: contact.id,
        contactName: contact.name,
        message: text
      })
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendAudio = async (blob) => {
    toast.loading('Subiendo audio...', { id: 'audio' })
    try {
      const publicUrl = await uploadAudio(blob)
      await sendOutboundMessage({
        phone: contact.phone,
        agentSlug: agent.slug,
        agentId: agent.id,
        contactId: contact.id,
        contactName: contact.name,
        message: '',
        mediaUrl: publicUrl,
        mediaType: 'audio'
      })
      toast.success('Audio enviado', { id: 'audio' })
      refetch()
    } catch (err) {
      toast.error('Error enviando audio', { id: 'audio' })
    }
  }

  if (!contact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-primary-50/50 p-8 text-center text-primary-400">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-primary-100">
          <Bot size={48} className="text-primary-200" />
        </div>
        <h2 className="font-title text-2xl uppercase tracking-widest text-primary-500">Betel Messenger</h2>
        <p className="font-secondary text-sm mt-2">Selecciona una conversación para comenzar</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-primary-50/30 overflow-hidden">
      {/* Header */}
      <header className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-primary-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="sm:hidden p-2 -ml-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              aria-label="Volver"
              title="Volver"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200">
            {(contact.name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-primary-600 uppercase tracking-tight truncate">{contact.name || 'Sin nombre'}</h3>
            <div className="flex items-center gap-1.5 text-xs text-primary-400 font-mono">
              <Phone size={10} />
              <span className="truncate">{contact.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <div className="hidden sm:flex items-center gap-6">
            <Toggle 
              enabled={contact.bot_enabled} 
              onChange={(val) => onToggleBot(contact.id, val)}
              label="Asistente IA"
            />
            <button
              onClick={() => reopenConversation(contact.phone, agent.slug)}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent-500/20 active:scale-95"
              title="Abrir Ventana 24hs (Plantilla)"
            >
              <Zap size={14} fill="currentColor" />
              Ventana 24h
            </button>
          </div>

          <div className="sm:hidden relative">
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              aria-label="Menu"
              title="Menu"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-primary-100 rounded-xl shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenDetails?.()
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-primary-600 hover:bg-primary-50"
                >
                  Detalle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onToggleBot(contact.id, !contact.bot_enabled)
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-primary-600 hover:bg-primary-50"
                >
                  Asistente IA: {contact.bot_enabled ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    reopenConversation(contact.phone, agent.slug)
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-primary-600 hover:bg-primary-50"
                >
                  Ventana 24h
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-2"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendText} onSendAudio={handleSendAudio} />
    </div>
  )
}
