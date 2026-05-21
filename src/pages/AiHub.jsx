import { useState, useEffect } from 'react'
import { Sparkles, Compass, Copy, Check, MessageSquare, Image, Share2, FileText, ChevronRight, SquareArrowOutUpRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'

const AI_PLATFORMS = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    description: 'Generación de contenido, redacción y atención a clientes.',
    icon: '🧠',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
  },
  {
    name: 'Claude AI',
    url: 'https://claude.ai',
    description: 'Análisis detallado de finanzas, redacción de correos largos y planes.',
    icon: '🔮',
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50'
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    description: 'Investigación rápida de tendencias de moda y marketing digital.',
    icon: '✨',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50'
  },
  {
    name: 'Midjourney',
    url: 'https://midjourney.com',
    description: 'Creación de imágenes realistas, maquetas y estampados de ropa.',
    icon: '🎨',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/50'
  },
  {
    name: 'v0 by Vercel',
    url: 'https://v0.dev',
    description: 'Diseño rápido de interfaces web para tu tienda online.',
    icon: '💻',
    color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100/50'
  },
  {
    name: 'Pinterest',
    url: 'https://pinterest.com',
    description: 'Tableros de inspiración y tendencias de ropa cristiana.',
    icon: '📌',
    color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50'
  }
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
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_TEMPLATES[0])
  const [copied, setCopied] = useState(false)
  const [notes, setNotes] = useState('')
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

  const handleCopy = () => {
    let textToCopy = selectedPrompt.template
    
    // Replace custom inputs if on the description template
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

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Portal de Inteligencia Artificial</h1>
          </div>
          <p className="text-sm text-primary-400 font-secondary mt-1">
            Centraliza tus herramientas de IA en un solo lugar y potencia el crecimiento de Betel Boutique.
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-2 text-xs text-primary-500 font-secondary flex items-center gap-1.5">
          <Sparkles size={14} className="text-accent-500 animate-pulse" />
          <span>Productividad Aumentada con IA</span>
        </div>
      </div>

      {/* Quick Launchpad Browser Mock */}
      <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
        {/* Mock browser header */}
        <div className="bg-primary-50 px-4 py-3 border-b border-primary-100 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div className="flex-1 max-w-lg mx-auto bg-white border border-primary-200 rounded-lg px-3 py-1 flex items-center justify-between text-xs text-primary-400">
            <span className="truncate flex items-center gap-1">
              🔒 <span className="font-bold text-primary-600">betel.boutique.soft</span>/ai-navigator
            </span>
            <Compass size={12} className="text-primary-300" />
          </div>
        </div>

        {/* Platform Grid */}
        <div className="p-6">
          <h3 className="font-title text-lg uppercase tracking-wider text-primary-600 mb-4">Acceso Rápido a tus Cuentas de IA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_PLATFORMS.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={`p-4 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <SquareArrowOutUpRight size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                  <p className="text-xs opacity-80 leading-relaxed">{p.description}</p>
                </div>
                <div className="mt-3 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir pestaña <ChevronRight size={10} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Prompts Toolkit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Templates List */}
        <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm space-y-4">
          <h3 className="font-title text-lg uppercase tracking-wider text-primary-600">Asistente de Prompts</h3>
          <p className="text-xs text-primary-400 font-secondary">
            Selecciona un caso de uso, personaliza sus variables y copia el prompt directo a ChatGPT o Claude.
          </p>
          <div className="space-y-2">
            {PROMPT_TEMPLATES.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedPrompt(t)
                    setCopied(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                    selectedPrompt.id === t.id
                      ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                      : 'border-primary-100 hover:bg-primary-50/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedPrompt.id === t.id ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-500'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-primary-700">{t.title}</h4>
                    <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest block mt-0.5">{t.category}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Center: Template Customizer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-primary-100 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h3 className="font-title text-xl uppercase tracking-wider text-primary-700">{selectedPrompt.title}</h3>
              <span className="text-[10px] font-bold bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {selectedPrompt.category}
              </span>
            </div>

            {/* Custom Inputs for Description Generator */}
            {selectedPrompt.id === 'desc' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <div className="text-xs font-bold text-primary-600 md:col-span-2 uppercase tracking-wide">Personalizar Variables:</div>
                <input
                  type="text"
                  value={inputs.title}
                  onChange={e => setInputs(p => ({ ...p, title: e.target.value }))}
                  placeholder="Nombre de prenda"
                  className="px-3 py-2 bg-white border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 font-bold"
                />
                <input
                  type="text"
                  value={inputs.style}
                  onChange={e => setInputs(p => ({ ...p, style: e.target.value }))}
                  placeholder="Estilo (Ej: Oversize)"
                  className="px-3 py-2 bg-white border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
                />
                <input
                  type="text"
                  value={inputs.detail}
                  onChange={e => setInputs(p => ({ ...p, detail: e.target.value }))}
                  placeholder="Detalle estampa"
                  className="px-3 py-2 bg-white border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 md:col-span-2"
                />
                <input
                  type="text"
                  value={inputs.verse}
                  onChange={e => setInputs(p => ({ ...p, verse: e.target.value }))}
                  placeholder="Inspiración / Versículo"
                  className="px-3 py-2 bg-white border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 md:col-span-2"
                />
              </div>
            )}

            {/* Readonly Raw Prompt Preview */}
            <div className="bg-primary-900 text-primary-100 p-4 rounded-xl font-mono text-xs max-h-60 overflow-y-auto leading-relaxed border border-primary-950">
              {selectedPrompt.id === 'desc' ? (
                selectedPrompt.template
                  .replace('[Nombre de la prenda]', inputs.title)
                  .replace('[Ej: Oversize, Clásico, Urbano]', inputs.style)
                  .replace('[Ej: Estampa "Fe" minimalista]', inputs.detail)
                  .replace('[Ej: Basado en Hebreos 11:1]', inputs.verse)
              ) : selectedPrompt.template}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-primary-50 flex items-center justify-end">
            <Button onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '¡Prompt Copiado!' : 'Copiar Prompt para la IA'}
            </Button>
          </div>
        </div>
      </div>

      {/* Built-in AI Workspace Notes pad */}
      <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm space-y-3">
        <h3 className="font-title text-lg uppercase tracking-wider text-primary-600">Bloc de Trabajo de IA (Notas Rápidas)</h3>
        <p className="text-xs text-primary-400 font-secondary">
          Escribe ideas, copys generados o borradores mientras interactúas con las IAs. Se guarda automáticamente de forma local.
        </p>
        <textarea
          value={notes}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Escribe aquí tus borradores o copys interesantes para no perderlos..."
          rows={5}
          className="block w-full px-4 py-3 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600 resize-none font-secondary"
        />
      </div>
    </div>
  )
}
