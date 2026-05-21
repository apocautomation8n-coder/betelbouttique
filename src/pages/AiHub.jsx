import { useState, useEffect, useRef } from 'react'
import { Sparkles, Copy, Check, MessageSquare, Image, Share2, FileText, ExternalLink, User, Plus, Trash2, BookOpen, Clipboard, StickyNote, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

/* ───────── AI Platforms ───────── */
const AI_TOOLS = [
  { id: 'chatgpt',  name: 'ChatGPT',       url: 'https://chatgpt.com',        icon: '🧠', color: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:shadow-emerald-200/50' },
  { id: 'claude',   name: 'Claude',         url: 'https://claude.ai',          icon: '🔮', color: 'bg-amber-50 border-amber-200 text-amber-800 hover:shadow-amber-200/50' },
  { id: 'gemini',   name: 'Gemini',         url: 'https://gemini.google.com',  icon: '✨', color: 'bg-blue-50 border-blue-200 text-blue-800 hover:shadow-blue-200/50' },
  { id: 'midj',     name: 'Midjourney',     url: 'https://midjourney.com',     icon: '🎨', color: 'bg-purple-50 border-purple-200 text-purple-800 hover:shadow-purple-200/50' },
  { id: 'v0',       name: 'v0 by Vercel',   url: 'https://v0.dev',             icon: '💻', color: 'bg-gray-50 border-gray-200 text-gray-800 hover:shadow-gray-200/50' },
  { id: 'pinterest',name: 'Pinterest',      url: 'https://pinterest.com',      icon: '📌', color: 'bg-red-50 border-red-200 text-red-800 hover:shadow-red-200/50' },
  { id: 'canva',    name: 'Canva',          url: 'https://canva.com',          icon: '🎯', color: 'bg-teal-50 border-teal-200 text-teal-800 hover:shadow-teal-200/50' },
  { id: 'notion',   name: 'Notion',         url: 'https://notion.so',          icon: '📝', color: 'bg-stone-50 border-stone-200 text-stone-800 hover:shadow-stone-200/50' },
]

/* ───────── Prompt Templates ───────── */
const PROMPT_TEMPLATES = [
  {
    id: 'desc', title: 'Descripción de Prenda', icon: MessageSquare, category: 'Marketing',
    template: 'Actúa como un experto en redacción para una marca de ropa cristiana premium llamada Betel Boutique. Escribe una descripción de producto atractiva y elegante para una prenda con las siguientes características:\n\n- Producto: [PRODUCTO]\n- Estilo: [ESTILO]\n- Detalle o Estampado: [DETALLE]\n- Mensaje de Inspiración Cristiana: [INSPIRACION]\n- Público Objetivo: Jóvenes cristianos modernos\n\nIncluye un título llamativo, una breve introducción que inspire fe, viñetas con los detalles del producto, sugerencias de outfits y hashtags cristianos de moda.',
  },
  {
    id: 'insta', title: 'Plan de Instagram (5 días)', icon: Image, category: 'Redes',
    template: 'Escribe un calendario de contenidos para Instagram de 5 días para nuestra tienda de ropa cristiana, Betel Boutique. Cada publicación debe tener:\n\n1. Concepto visual\n2. El texto ("copys") listo para publicar\n3. Una cita bíblica sutil\n4. Call to Action\n5. Lista de hashtags populares de moda de fe.',
  },
  {
    id: 'ads', title: 'Anuncios de Fe (FB & IG)', icon: Share2, category: 'Publicidad',
    template: 'Crea 3 variaciones de anuncios altamente persuasivos para vender nuestra colección de buzos y remeras de fe cristiana de Betel Boutique.\n\nVariación 1: Enfoque emocional (inspiración de fe).\nVariación 2: Enfoque de beneficios y diseño premium.\nVariación 3: Oferta o Gancho rápido.\n\nCada uno debe incluir título llamativo, texto principal, descripción del enlace y sugerencia de imagen.',
  },
  {
    id: 'email', title: 'E-mail Lanzamiento', icon: FileText, category: 'Ventas',
    template: 'Escribe una campaña de correo electrónico atractiva e inspiradora para enviar a nuestros suscriptores con motivo del lanzamiento de la nueva colección de prendas cristianas de Betel Boutique.\n\nAsuntos sugeridos (3 opciones).\n\nCuerpo del correo con saludo, introducción, 2 productos estrella, botón de compra, y garantía de envíos en pesos argentinos.',
  }
]

/* ───────── Local Storage helpers ───────── */
const LS_KEY_NOTES = 'betel_ai_notes'
const LS_KEY_CLIPS = 'betel_ai_clipboard'
const LS_KEY_PROFILES = 'betel_ai_profiles'

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}
function saveLS(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
export default function AiHub() {
  // ── State ──
  const [notes, setNotes] = useState('')
  const [clips, setClips] = useState([])
  const [profiles, setProfiles] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_TEMPLATES[0])
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('launcher') // launcher | prompts | clipboard | notes
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [newProfile, setNewProfile] = useState({ name: '', email: '', tools: '' })
  const windowRefs = useRef({})

  // ── Load from localStorage ──
  useEffect(() => {
    setNotes(localStorage.getItem(LS_KEY_NOTES) || '')
    setClips(loadLS(LS_KEY_CLIPS, []))
    setProfiles(loadLS(LS_KEY_PROFILES, [
      { id: '1', name: 'Cuenta Personal', email: 'mi-email@gmail.com', tools: 'ChatGPT, Gemini' },
      { id: '2', name: 'Cuenta Betel Boutique', email: 'betel@gmail.com', tools: 'Canva, Pinterest, ChatGPT' },
    ]))
  }, [])

  // ── Persist ──
  const updateNotes = (val) => { setNotes(val); localStorage.setItem(LS_KEY_NOTES, val) }
  const updateClips = (val) => { setClips(val); saveLS(LS_KEY_CLIPS, val) }
  const updateProfiles = (val) => { setProfiles(val); saveLS(LS_KEY_PROFILES, val) }

  // ── Open AI tool in managed popup ──
  const openTool = (tool) => {
    const w = 1020, h = 820
    const left = (window.screen.width - w) / 2
    const top = (window.screen.height - h) / 2
    const win = window.open(
      tool.url, 
      `betel_${tool.id}`,
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`
    )
    if (win) {
      windowRefs.current[tool.id] = win
      toast.success(`${tool.name} abierto — ventana limpia sin pestañas extra`)
    }
  }

  // ── Copy prompt ──
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(selectedPrompt.template)
    setCopied(true)
    toast.success('¡Prompt copiado al portapapeles!')
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Clipboard manager ──
  const addClip = () => {
    const text = window.prompt('Pega el texto que quieras guardar:')
    if (text && text.trim()) {
      const updated = [{ id: Date.now().toString(), text: text.trim(), date: new Date().toLocaleString('es-AR') }, ...clips]
      updateClips(updated)
      toast.success('Texto guardado en el portapapeles')
    }
  }
  const removeClip = (id) => { updateClips(clips.filter(c => c.id !== id)) }
  const copyClip = (text) => { navigator.clipboard.writeText(text); toast.success('Copiado') }

  // ── Profiles ──
  const addProfile = (e) => {
    e.preventDefault()
    if (!newProfile.name) return
    const updated = [...profiles, { id: Date.now().toString(), ...newProfile }]
    updateProfiles(updated)
    setNewProfile({ name: '', email: '', tools: '' })
    setShowProfileModal(false)
    toast.success('Perfil de cuenta agregado')
  }
  const removeProfile = (id) => { updateProfiles(profiles.filter(p => p.id !== id)) }

  /* ── Tabs config ── */
  const tabs = [
    { id: 'launcher', label: '🚀 Lanzador', title: 'Abre tus IAs en ventanas limpias' },
    { id: 'prompts', label: '✍️ Prompts', title: 'Genera y copia prompts' },
    { id: 'clipboard', label: '📋 Portapapeles', title: 'Guarda textos de las IAs' },
    { id: 'notes', label: '📝 Notas', title: 'Bloc de notas rápido' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide flex items-center gap-3">
            Centro de IA
            <Sparkles size={28} className="text-accent-500 animate-pulse" />
          </h1>
          <p className="text-sm text-primary-400 font-secondary mt-1">
            Organiza tus herramientas de IA, perfiles de Google y prompts en un solo lugar. Sin 15 pestañas abiertas.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white rounded-xl border border-primary-100 p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === t.id
                ? 'bg-primary-600 text-white shadow'
                : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════ TAB: LAUNCHER ════════════ */}
      {activeTab === 'launcher' && (
        <div className="space-y-6">
          {/* AI Tools Grid */}
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
            <h3 className="font-title text-lg uppercase tracking-wider text-primary-600 mb-1">Acceso Rápido a tus IAs</h3>
            <p className="text-xs text-primary-400 font-secondary mb-4">
              Cada herramienta se abre en una ventana propia, limpia y sin barra de pestañas. Podés tener varias abiertas a la vez como apps independientes.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AI_TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => openTool(tool)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 group hover:shadow-lg text-left ${tool.color}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-bold text-sm">{tool.name}</h4>
                  <p className="text-[10px] opacity-60 mt-0.5">Clic para abrir</p>
                </button>
              ))}
            </div>
          </div>

          {/* Google Account Profiles */}
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-title text-lg uppercase tracking-wider text-primary-600">Perfiles de Cuenta</h3>
                <p className="text-xs text-primary-400 font-secondary mt-0.5">
                  Organiza qué cuenta de Google usás en cada IA para no confundirte al cambiar de sesión.
                </p>
              </div>
              <Button onClick={() => setShowProfileModal(true)}>
                <Plus size={16} /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {profiles.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100 group">
                  <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-primary-700">{p.name}</h4>
                    <p className="text-xs text-primary-400 truncate">{p.email}</p>
                    {p.tools && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tools.split(',').map((t, i) => (
                          <span key={i} className="text-[9px] bg-primary-200 text-primary-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeProfile(p.id)} className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB: PROMPTS ════════════ */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selector */}
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5 space-y-3">
            <h3 className="font-title text-lg uppercase tracking-wider text-primary-600">Plantillas</h3>
            <div className="space-y-2">
              {PROMPT_TEMPLATES.map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedPrompt(t); setCopied(false) }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedPrompt.id === t.id
                        ? 'border-primary-600 bg-primary-50 shadow-sm'
                        : 'border-primary-100 hover:bg-primary-50/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedPrompt.id === t.id ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-500'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-primary-700">{t.title}</h4>
                      <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">{t.category}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prompt Preview & Copy */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-primary-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-primary-100 pb-3 mb-4">
              <h3 className="font-title text-xl uppercase tracking-wider text-primary-700">{selectedPrompt.title}</h3>
              <span className="text-[10px] font-bold bg-primary-100 text-primary-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{selectedPrompt.category}</span>
            </div>
            <div className="bg-primary-900 text-primary-100 p-5 rounded-xl font-mono text-xs flex-1 overflow-y-auto leading-relaxed whitespace-pre-wrap max-h-72">
              {selectedPrompt.template}
            </div>
            <div className="mt-4 pt-4 border-t border-primary-100 flex items-center justify-between">
              <p className="text-xs text-primary-400 font-secondary">Copia el prompt → abrí la IA → pega y listo</p>
              <Button onClick={handleCopyPrompt}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '¡Copiado!' : 'Copiar Prompt'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB: CLIPBOARD ════════════ */}
      {activeTab === 'clipboard' && (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-title text-lg uppercase tracking-wider text-primary-600 flex items-center gap-2">
                <Clipboard size={18} /> Portapapeles Inteligente
              </h3>
              <p className="text-xs text-primary-400 font-secondary mt-0.5">
                Guardá textos, respuestas de IAs o copys que te gustaron para reutilizarlos después.
              </p>
            </div>
            <Button onClick={addClip}>
              <Plus size={16} /> Guardar Texto
            </Button>
          </div>

          {clips.length === 0 ? (
            <div className="text-center py-12 text-primary-300">
              <Clipboard size={40} className="mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-secondary text-sm">Tu portapapeles está vacío</p>
              <p className="text-xs mt-1">Hacé clic en "Guardar Texto" para pegar una respuesta de IA.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clips.map(clip => (
                <div key={clip.id} className="p-4 bg-primary-50/50 rounded-xl border border-primary-100 group">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-primary-600 font-secondary leading-relaxed line-clamp-4 flex-1">{clip.text}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyClip(clip.text)} className="p-1.5 bg-primary-200 text-primary-600 rounded-lg hover:bg-primary-300 transition-all" title="Copiar">
                        <Copy size={12} />
                      </button>
                      <button onClick={() => removeClip(clip.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100" title="Eliminar">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-primary-300 mt-2 font-mono">{clip.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB: NOTES ════════════ */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-title text-lg uppercase tracking-wider text-primary-600 flex items-center gap-2">
              <StickyNote size={18} /> Bloc de Trabajo
            </h3>
            <p className="text-xs text-primary-400 font-secondary mt-0.5">
              Escribí ideas, borradores, copys o lo que se te ocurra mientras trabajás con las IAs. Se guarda automáticamente.
            </p>
          </div>
          <textarea
            value={notes}
            onChange={e => updateNotes(e.target.value)}
            placeholder="Escribí aquí tus notas, borradores o copys..."
            rows={18}
            className="block w-full px-5 py-4 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-700 resize-none font-secondary leading-relaxed"
          />
        </div>
      )}

      {/* ══ Add Profile Modal ══ */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Agregar Perfil de Cuenta">
        <form onSubmit={addProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Nombre del perfil</label>
            <input type="text" value={newProfile.name} onChange={e => setNewProfile(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Cuenta Personal" required className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Email / cuenta de Google</label>
            <input type="text" value={newProfile.email} onChange={e => setNewProfile(p => ({ ...p, email: e.target.value }))} placeholder="Ej: betel@gmail.com" className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">IAs que usa esta cuenta (separadas por coma)</label>
            <input type="text" value={newProfile.tools} onChange={e => setNewProfile(p => ({ ...p, tools: e.target.value }))} placeholder="Ej: ChatGPT, Gemini, Canva" className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600" />
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Button type="submit">Guardar Perfil</Button>
            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
