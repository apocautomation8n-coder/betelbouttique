import { useState, useEffect } from 'react'
import { Sparkles, Compass, Copy, Check, MessageSquare, Image, Share2, FileText, ChevronRight, ArrowLeft, ArrowRight, RotateCw, Home, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'

const AI_PLATFORMS = [
  { name: 'ChatGPT', url: 'https://chatgpt.com', icon: '🧠' },
  { name: 'Claude AI', url: 'https://claude.ai', icon: '🔮' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: '✨' },
  { name: 'Midjourney', url: 'https://midjourney.com', icon: '🎨' },
  { name: 'v0 by Vercel', url: 'https://v0.dev', icon: '💻' },
  { name: 'Pinterest', url: 'https://pinterest.com', icon: '📌' }
]

const PROMPT_TEMPLATES = [
  {
    id: 'desc',
    title: 'Descripción de Prenda Cristiana',
    icon: MessageSquare,
    category: 'Marketing',
    template: 'Actúa como un experto en redacción para una marca de ropa cristiana premium llamada Betel Boutique. Escribe una descripción de producto atractiva y elegante para una prenda con las siguientes características:\n\n- Producto: [Nombre de la prenda]\n- Estilo: [Ej: Oversize, Clásico, Urbano]\n- Detalle o Estampado: [Ej: Estampa "Fe" minimalista]\n- Mensaje de Inspiración Cristiana: [Ej: Basado en Hebreos 11:1]\n- Público Objetivo: Jóvenes cristianos modernos\n\nIncluye un título llamativo, una breve introducción que inspire fe, viñetas con los detalles del producto, sugerencias de outfits y hashtags cristianos de moda.',
  },
  {
    id: 'insta',
    title: 'Plan de Contenido de Instagram',
    icon: Image,
    category: 'Redes Sociales',
    template: 'Escribe un calendario de contenidos para Instagram de 5 días para nuestra tienda de ropa cristiana, Betel Boutique. Cada publicación debe tener:\n\n1. Concepto visual de la foto/video de ropa cristiana elegante.\n2. El texto ("copys") listo para publicar.\n3. Una cita bíblica sutil integrada de manera natural.\n4. Call to Action (llamado a la acción) para comprar o interactuar.\n5. Lista de hashtags populares de moda de fe.',
  },
  {
    id: 'ads',
    title: 'Anuncios de Fe (Facebook & Instagram)',
    icon: Share2,
    category: 'Publicidad',
    template: 'Crea 3 variaciones de anuncios altamente persuasivos para vender nuestra colección de buzos y remeras de fe cristiana de Betel Boutique. \n\nVariación 1: Enfoque emocional (inspiración de fe).\nVariación 2: Enfoque de beneficios y diseño premium.\nVariación 3: Oferta o Gancho rápido.\n\nCada uno debe incluir un título llamativo, texto principal (copys), descripción corta del enlace y sugerencia de imagen.',
  },
  {
    id: 'email',
    title: 'E-mail de Lanzamiento de Colección',
    icon: FileText,
    category: 'Ventas',
    template: 'Escribe una campaña de correo electrónico atractiva e inspiradora para enviar a nuestros suscriptores con motivo del lanzamiento de la nueva colección de prendas cristianas de Betel Boutique.\n\nAsuntos sugeridos (escribe 3 opciones que mezclen elegancia y fe).\n\nCuerpo del correo:\n- Saludo cordial y mensaje inspirador de gratitud.\n- Introducción a la nueva colección con diseños exclusivos.\n- Destacar 2 productos estrella (Remeras con estampas de fe y Buzos premium).\n- Botón de compra / enlace directo.\n- Garantía de envíos rápidos a todo el país en pesos argentinos.',
  }
]

export default function AiHub() {
  const [currentUrl, setCurrentUrl] = useState('https://chatgpt.com')
  const [urlInput, setUrlInput] = useState('https://chatgpt.com')
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_TEMPLATES[0])
  const [copied, setCopied] = useState(false)
  const [notes, setNotes] = useState('')
  const [showHelper, setShowHelper] = useState(true)
  
  const [inputs, setInputs] = useState({
    title: 'Buzo Hoodie Grace',
    style: 'Oversize con capucha',
    detail: 'Estampa bordada minimalista en el pecho que dice "Grace"',
    verse: 'Efesios 2:8 (Salvos por gracia)',
  })

  useEffect(() => {
    const savedNotes = localStorage.getItem('betel_ai_hub_notes')
    if (savedNotes) setNotes(savedNotes)
  }, [])

  const handleNotesChange = (val) => {
    setNotes(val)
    localStorage.setItem('betel_ai_hub_notes', val)
  }

  const navigateToUrl = (e) => {
    e.preventDefault()
    let url = urlInput.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }
    setCurrentUrl(url)
    setUrlInput(url)
  }

  const selectPlatform = (url) => {
    setCurrentUrl(url)
    setUrlInput(url)
  }

  const handleCopy = () => {
    let textToCopy = selectedPrompt.template
    
    if (selectedPrompt.id === 'desc') {
      textToCopy = textToCopy
        .replace('[Nombre de la prenda]', inputs.title)
        .replace('[Ej: Oversize, Clásico, Urbano]', inputs.style)
        .replace('[Ej: Estampa "Fe" minimalista]', inputs.detail)
        .replace('[Ej: Basado en Hebreos 11:1]', inputs.verse)
    }

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('¡Prompt personalizado copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const reloadIframe = () => {
    const iframe = document.getElementById('chrome-iframe')
    if (iframe) {
      iframe.src = currentUrl
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen overflow-hidden bg-primary-50">
      
      {/* Top Banner / Extension Help */}
      <div className="bg-gradient-to-r from-accent-600 to-amber-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Sparkles size={14} className="text-accent-100 animate-pulse shrink-0" />
          <span className="truncate">
            <span className="font-bold">💡 Tip Pro para visualización directa:</span> Para usar ChatGPT, Claude y Gemini integrados sin bloqueos, instala la extensión de Chrome 
            <a 
              href="https://chromewebstore.google.com/detail/ignore-x-frame-headers/gleekbnehedocjjpglalokgiedlllhoc" 
              target="_blank" 
              rel="noreferrer" 
              className="underline font-black mx-1 hover:text-accent-100"
            >
              Ignore X-Frame-Headers
            </a> 
            y recarga la página.
          </span>
        </div>
        <a 
          href="https://chromewebstore.google.com/detail/ignore-x-frame-headers/gleekbnehedocjjpglalokgiedlllhoc" 
          target="_blank" 
          rel="noreferrer" 
          className="ml-4 shrink-0 bg-white/20 hover:bg-white/35 font-bold px-2 py-0.5 rounded transition-all"
        >
          Instalar Extensión 🚀
        </a>
      </div>

      {/* Main Workspace split screen */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Left Side: Literal Chrome Browser */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-primary-200">
          
          {/* Chrome Toolbar */}
          <div className="bg-primary-100/60 p-2.5 border-b border-primary-200 flex items-center gap-2 shrink-0">
            {/* Nav controls */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => selectPlatform('https://chatgpt.com')} 
                className="p-1.5 hover:bg-primary-200/60 rounded-lg text-primary-500 transition-colors" 
                title="Volver a ChatGPT"
              >
                <ArrowLeft size={16} />
              </button>
              <button 
                className="p-1.5 opacity-40 rounded-lg text-primary-500" 
                disabled
              >
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={reloadIframe} 
                className="p-1.5 hover:bg-primary-200/60 rounded-lg text-primary-500 transition-colors" 
                title="Recargar"
              >
                <RotateCw size={14} />
              </button>
              <button 
                onClick={() => selectPlatform('https://chatgpt.com')} 
                className="p-1.5 hover:bg-primary-200/60 rounded-lg text-primary-500 transition-colors" 
                title="Inicio"
              >
                <Home size={16} />
              </button>
            </div>

            {/* Address Bar */}
            <form onSubmit={navigateToUrl} className="flex-1 relative">
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="w-full bg-white border border-primary-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono shadow-inner"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🔒</span>
            </form>

            {/* Helper Toggle */}
            <button 
              onClick={() => setShowHelper(!showHelper)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                showHelper 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'bg-primary-200 text-primary-600 hover:bg-primary-300'
              }`}
            >
              <Sparkles size={13} />
              {showHelper ? 'Ocultar Prompts' : 'Mostrar Prompts'}
            </button>
          </div>

          {/* Platform Tabs Bar */}
          <div className="bg-primary-50 px-3 py-1.5 border-b border-primary-200 flex flex-wrap gap-1.5 shrink-0">
            {AI_PLATFORMS.map(p => (
              <button
                key={p.name}
                onClick={() => selectPlatform(p.url)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentUrl === p.url 
                    ? 'bg-white text-primary-700 border border-primary-200 shadow-sm' 
                    : 'text-primary-400 hover:text-primary-600 hover:bg-primary-100/50'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Literal Iframe Browser Window */}
          <div className="flex-1 w-full bg-primary-100/30 relative">
            <iframe
              id="chrome-iframe"
              src={currentUrl}
              className="w-full h-full border-none bg-white"
              title="Chrome Integrado"
              allow="clipboard-write; clipboard-read; microphone; camera"
            />
          </div>
        </div>

        {/* Right Side: Prompts & Notes helper */}
        {showHelper && (
          <div className="w-80 lg:w-96 flex flex-col shrink-0 bg-white overflow-y-auto border-l border-primary-200 p-5 space-y-6">
            
            {/* Prompts Toolkit */}
            <div className="space-y-4">
              <div className="border-b border-primary-100 pb-3">
                <h3 className="font-title text-xl uppercase tracking-wider text-primary-700 flex items-center gap-2">
                  <Sparkles size={18} className="text-accent-500" />
                  Asistente de Prompts
                </h3>
                <p className="text-[10px] text-primary-400 font-secondary mt-0.5">
                  Genera copys de alta conversión para Betel Boutique
                </p>
              </div>

              {/* Template Picker */}
              <div className="grid grid-cols-2 gap-2">
                {PROMPT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedPrompt(t)
                      setCopied(false)
                    }}
                    className={`p-2 rounded-xl border text-left transition-all duration-200 ${
                      selectedPrompt.id === t.id
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm text-primary-800'
                        : 'border-primary-100 hover:bg-primary-50/20 text-primary-500'
                    }`}
                  >
                    <h4 className="font-bold text-[10px] truncate">{t.title}</h4>
                    <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest block mt-0.5">{t.category}</span>
                  </button>
                ))}
              </div>

              {/* Variables customizer */}
              {selectedPrompt.id === 'desc' && (
                <div className="space-y-2 p-3 bg-primary-50/50 rounded-xl border border-primary-100 text-xs">
                  <div className="font-bold text-primary-600 uppercase tracking-wide text-[10px]">Variables:</div>
                  <input
                    type="text"
                    value={inputs.title}
                    onChange={e => setInputs(p => ({ ...p, title: e.target.value }))}
                    placeholder="Prenda"
                    className="w-full px-2.5 py-1.5 bg-white border border-primary-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-600 font-bold"
                  />
                  <input
                    type="text"
                    value={inputs.style}
                    onChange={e => setInputs(p => ({ ...p, style: e.target.value }))}
                    placeholder="Estilo"
                    className="w-full px-2.5 py-1.5 bg-white border border-primary-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={inputs.detail}
                    onChange={e => setInputs(p => ({ ...p, detail: e.target.value }))}
                    placeholder="Estampa"
                    className="w-full px-2.5 py-1.5 bg-white border border-primary-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={inputs.verse}
                    onChange={e => setInputs(p => ({ ...p, verse: e.target.value }))}
                    placeholder="Inspiración"
                    className="w-full px-2.5 py-1.5 bg-white border border-primary-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {/* Copy prompt button */}
              <button 
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '¡Prompt Copiado!' : 'Copiar Prompt'}
              </button>
            </div>

            {/* Notes Panel */}
            <div className="flex-1 flex flex-col min-h-[200px] border-t border-primary-100 pt-5">
              <h3 className="font-title text-sm uppercase tracking-wider text-primary-600 mb-2">Bloc de Notas de IA</h3>
              <textarea
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                placeholder="Pega las respuestas de tu IA o redacta borradores rápidos aquí..."
                className="flex-1 w-full p-3 bg-primary-50 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 text-primary-700 resize-none font-secondary leading-relaxed"
              />
            </div>
            
          </div>
        )}

      </div>
    </div>
  )
}
