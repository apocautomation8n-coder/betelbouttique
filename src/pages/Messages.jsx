import { useState } from 'react'
import { useAgents, useConversations, useContacts, normalizePhone, getPhoneVariants, mergeContacts, useLabels } from '../hooks/useMessages'
import { useRealtime } from '../hooks/useRealtime'
import ConversationList from '../components/chat/ConversationList'
import ChatWindow from '../components/chat/ChatWindow'
import ContactPanel from '../components/chat/ContactPanel'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LabelManager from '../components/chat/LabelManager'
import { Search, Plus, Bot, PanelRightOpen, PanelRightClose, Tag, Settings } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function Messages() {
  const { agents, loading: agentsLoading, addAgent } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showContactPanel, setShowContactPanel] = useState(true)
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentSlug, setNewAgentSlug] = useState('')
  const [search, setSearch] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactName, setNewContactName] = useState('')
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [selectedLabelId, setSelectedLabelId] = useState('all')
  const { labels } = useLabels()
  const { contacts } = useContacts()

  const activeAgent = selectedAgent || agents[0]
  const { conversations, loading: convsLoading, refetch, toggleContactBot, markAsReadLocally } = useConversations(activeAgent?.id)

  const currentContact = conversations.find(c => c.contact?.id === selectedContact?.id)?.contact || selectedContact

  useRealtime('messages', null, () => {
    refetch()
  })

  const filteredConversations = conversations.filter(conv => {
    const s = search.toLowerCase()
    const matchesSearch = !search || 
      conv.contact?.name?.toLowerCase().includes(s) ||
      conv.contact?.phone?.includes(s)
    const matchesLabel = selectedLabelId === 'all' || 
      conv.contact?.labels?.some(l => l.id === selectedLabelId)
    return matchesSearch && matchesLabel
  })

  const handleAddAgent = async () => {
    if (!newAgentName.trim() || !newAgentSlug.trim()) return
    await addAgent(newAgentName.trim(), newAgentSlug.trim().toLowerCase())
    setShowAddAgent(false)
  }

  const handleAddContact = async () => {
    const rawPhone = normalizePhone(newContactPhone.trim())
    if (!rawPhone) return toast.error('Teléfono inválido')
    
    try {
      const { data: existing } = await supabase.from('contacts').select('*').eq('phone', rawPhone).single()
      let contactId = existing?.id

      if (!contactId) {
        const { data: newC, error } = await supabase.from('contacts').insert({ phone: rawPhone, name: newContactName }).select().single()
        if (error) throw error
        contactId = newC.id
      }

      setShowAddContact(false)
      setNewContactPhone('')
      setNewContactName('')
      await refetch()
      setSelectedContact({ id: contactId, name: newContactName || rawPhone, phone: rawPhone })
    } catch (err) {
      toast.error('Error al procesar contacto')
    }
  }

  if (agentsLoading) return (
    <div className="h-full flex items-center justify-center bg-primary-100">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Agent Tabs */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-primary-100 bg-primary-50">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent)
                setSelectedContact(null)
              }}
              className={`
                px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all
                ${activeAgent?.id === agent.id
                  ? 'bg-primary-600 text-white shadow-md shadow-black/10'
                  : 'text-primary-400 hover:bg-primary-200/50 hover:text-primary-600'
                }
              `}
            >
              {agent.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddAgent(true)}
            className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded-xl"
            title="Nuevo Agente"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <Plus size={14} />
            Iniciar Conversación
          </button>
          <button
            onClick={() => setShowContactPanel(!showContactPanel)}
            className={`p-2 rounded-xl transition-all ${showContactPanel ? 'text-primary-600 bg-primary-100' : 'text-primary-400'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar: Chats */}
        <div className="w-80 flex flex-col border-r border-primary-100 bg-white shrink-0">
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 bg-primary-50 border border-primary-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                />
              </div>
              </div>
            </div>

            {/* Labels Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedLabelId('all')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-all ${selectedLabelId === 'all' ? 'bg-primary-600 border-primary-600 text-white' : 'border-primary-100 text-primary-400'}`}
              >
                Todos
              </button>
              {labels.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLabelId(prev => prev === l.id ? 'all' : l.id)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-all`}
                  style={{ 
                    backgroundColor: selectedLabelId === l.id ? l.color : 'transparent',
                    borderColor: l.color,
                    color: selectedLabelId === l.id ? 'white' : l.color
                  }}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <ConversationList
            conversations={filteredConversations}
            selectedContactId={currentContact?.id}
            onSelect={setSelectedContact}
            onDelete={() => {}}
            loading={convsLoading}
          />
        </div>

        {/* Chat Window */}
        <ChatWindow 
          agent={activeAgent} 
          contact={currentContact} 
          onToggleBot={toggleContactBot}
        />

        {/* Contact Detail */}
        {showContactPanel && currentContact && (
          <ContactPanel
            contact={currentContact}
            onClose={() => setShowContactPanel(false)}
            onToggleBot={toggleContactBot}
          />
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showAddAgent} onClose={() => setShowAddAgent(false)} title="Nuevo Agente">
        <div className="space-y-4">
          <Input label="Nombre" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} placeholder="ej: Boutique Online" />
          <Input label="Slug" value={newAgentSlug} onChange={e => setNewAgentSlug(e.target.value)} placeholder="ej: boutique" />
          <Button onClick={handleAddAgent} className="w-full mt-4">CREAR AGENTE</Button>
        </div>
      </Modal>

      <Modal isOpen={showAddContact} onClose={() => setShowAddContact(false)} title="Nueva Conversación">
        <div className="space-y-4">
          <Input label="Teléfono" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} placeholder="ej: +54911..." />
          <Input label="Nombre (Opcional)" value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="ej: Maria" />
          <Button onClick={handleAddContact} className="w-full mt-4">INICIAR CHAT</Button>
        </div>
      </Modal>
    </div>
  )
}
