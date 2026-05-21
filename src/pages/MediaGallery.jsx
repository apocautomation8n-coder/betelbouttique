import { useState } from 'react'
import { Plus, Search, Image as ImageIcon, Copy, Check, Trash2, ExternalLink } from 'lucide-react'
import { useMedia } from '../hooks/useMedia'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function MediaGallery() {
  const { data: mediaItems, isLoading, upload, deleteItem } = useMedia()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const [form, setForm] = useState({
    title: '',
    url: '',
    category: 'Remeras',
    size: '1.5 MB'
  })

  const categories = ['Todas', 'Remeras', 'Buzos', 'Gorras', 'Banners', 'Modelos', 'Otros']

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('¡Enlace copiado al portapapeles!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title || !form.url) {
      toast.error('Por favor completa el título y la URL de la imagen')
      return
    }
    await upload(form)
    setShowAddModal(false)
    setForm({ title: '', url: '', category: 'Remeras', size: '1.5 MB' })
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen de la galería?')) {
      await deleteItem(id)
    }
  }

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Galería de Imágenes</h1>
          <p className="text-sm text-primary-400 font-secondary mt-1">
            Almacena, copia y organiza las fotos de tus prendas para usarlas en tus productos y campañas.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Cargar Imagen
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-xl border border-primary-100 p-1 w-full lg:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === cat 
                  ? 'bg-primary-600 text-white shadow' 
                  : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar imagen..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder-primary-300 text-primary-600"
          />
        </div>
      </div>

      {/* Grid of Images */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary-300 bg-white rounded-2xl border border-primary-100 shadow-sm">
          <ImageIcon size={48} strokeWidth={1.5} />
          <p className="mt-3 font-secondary text-sm">No se encontraron imágenes en esta sección</p>
          <Button className="mt-4" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Cargar primera imagen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Image Preview Area */}
              <div className="relative h-48 bg-primary-50 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setPreviewImage(item)}>
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=400&q=80'
                  }}
                />
                <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider bg-white/90 text-primary-700 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                  {item.category}
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-mono bg-primary-900/70 text-white px-2 py-0.5 rounded">
                  {item.size || '1.0 MB'}
                </span>
              </div>

              {/* Detail Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-primary-700 text-sm leading-snug line-clamp-2 mb-3">{item.title}</h3>
                
                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto">
                  <button 
                    onClick={() => handleCopy(item.id, item.url)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      copiedId === item.id 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    }`}
                  >
                    {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === item.id ? 'Copiado' : 'Copiar Link'}
                  </button>
                  <button 
                    onClick={() => setPreviewImage(item)}
                    className="p-2 bg-primary-50 text-primary-500 hover:bg-primary-100 rounded-xl transition-all"
                    title="Ver Pantalla Completa"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Cargar Imagen a la Galería">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input 
            label="Título de la imagen" 
            value={form.title} 
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Ej: Remera Fe Beige Frontal" 
            required 
          />
          <Input 
            label="URL de la imagen" 
            value={form.url} 
            onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            placeholder="https://images.unsplash.com/..." 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Categoría</label>
              <select 
                value={form.category} 
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
              >
                {categories.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input 
              label="Peso estimado" 
              value={form.size} 
              onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
              placeholder="Ej: 1.5 MB" 
            />
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Button type="submit">Guardar Imagen</Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* Preview Fullscreen Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.title || 'Visualización'}>
        {previewImage && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="max-h-[60vh] w-full rounded-xl overflow-hidden bg-primary-50 flex items-center justify-center">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
            <div className="w-full flex items-center justify-between gap-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-primary-400 block font-secondary">Categoría</span>
                <span className="text-xs font-bold text-primary-700">{previewImage.category}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-primary-400 block font-secondary">Peso del archivo</span>
                <span className="text-xs font-bold text-primary-700">{previewImage.size}</span>
              </div>
              <Button onClick={() => handleCopy(previewImage.id, previewImage.url)}>
                Copiar Enlace Directo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
