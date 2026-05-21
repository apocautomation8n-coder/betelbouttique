import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  Folder,
  Grid,
  List,
  Info,
  HardDrive,
  Users,
  Clock,
  Star,
  ChevronRight,
  X
} from 'lucide-react'
import { useMedia } from '../hooks/useMedia'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const FOLDERS = [
  { name: 'Instagram Feed', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { name: 'Instagram Stories', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Facebook & Meta Ads', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Banners Web', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Fotos Producto', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Logos & Branding', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { name: 'Otros', color: 'bg-gray-100 text-gray-700 border-gray-200' }
]

export default function MediaGallery() {
  const { data: mediaItems, isLoading, upload, deleteItem } = useMedia()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [selectedFile, setSelectedFile] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadMode, setUploadMode] = useState('file') // file | url

  const [form, setForm] = useState({
    title: '',
    url: '',
    category: 'Instagram Feed',
    size: '1.5 MB',
    file: null,
    filePreview: null
  })

  const categories = ['Todas', ...FOLDERS.map(f => f.name)]

  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '')

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('¡Enlace copiado al portapapeles!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFileSelect = (file) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    setForm(p => ({
      ...p,
      file,
      filePreview: preview,
      title: p.title || file.name,
      size: file.size >= 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.round(file.size / 1024) + ' KB'
    }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const resetForm = () => {
    if (form.filePreview) URL.revokeObjectURL(form.filePreview)
    setForm({ title: '', url: '', category: activeCategory !== 'Todas' ? activeCategory : 'Instagram Feed', size: '1.5 MB', file: null, filePreview: null })
    setUploadMode('file')
  }

  const handleAdd = async (e) => {
    e.preventDefault()

    if (uploadMode === 'file' && form.file) {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', form.file)
        const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Error del servidor al subir')
        const data = await res.json()
        await upload({ title: form.title, url: data.url, category: form.category, size: data.size })
        setShowAddModal(false)
        resetForm()
      } catch (err) {
        toast.error('Error al subir: ' + err.message)
      } finally {
        setUploading(false)
      }
    } else if (uploadMode === 'url' && form.url) {
      await upload({ title: form.title, url: form.url, category: form.category, size: form.size })
      setShowAddModal(false)
      resetForm()
    } else {
      toast.error('Seleccioná un archivo o pegá una URL')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen de la galería?')) {
      await deleteItem(id)
      if (selectedFile?.id === id) {
        setSelectedFile(null)
      }
    }
  }

  const getFileCount = (categoryName) => {
    return mediaItems?.filter(item => item.category === categoryName).length || 0
  }

  const totalSizeStr = (() => {
    let kbSum = 0
    mediaItems?.forEach(item => {
      const val = parseFloat(item.size) || 1.0
      if (item.size?.toLowerCase().includes('mb')) {
        kbSum += val * 1024
      } else {
        kbSum += val
      }
    })
    return (kbSum / 1024).toFixed(1) + ' MB'
  })()

  const sizePercentage = (() => {
    let kbSum = 0
    mediaItems?.forEach(item => {
      const val = parseFloat(item.size) || 1.0
      if (item.size?.toLowerCase().includes('mb')) {
        kbSum += val * 1024
      } else {
        kbSum += val
      }
    })
    // Simulate percentage of a 15GB drive
    return Math.min(100, (kbSum / (15 * 1024 * 1024)) * 100).toFixed(4)
  })()

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Carpeta de Contenido</h1>
        <p className="text-sm text-primary-400 font-secondary mt-1">
          Sube, organiza y copia enlaces de tus placas de Instagram, Stories, anuncios y fotos de prendas.
        </p>
      </div>

      <div className="flex h-[calc(100vh-14rem)] min-h-[500px] overflow-hidden bg-primary-50/20 rounded-3xl border border-primary-100 shadow-sm">
        {/* Drive Internal Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-primary-100 p-4 shrink-0 justify-between">
          <div className="space-y-6">
            <Button onClick={() => setShowAddModal(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <Plus size={20} />
              <span className="font-bold">Nuevo</span>
            </Button>

            <div className="space-y-1">
              <button
                onClick={() => { setActiveCategory('Todas'); setSelectedFile(null) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === 'Todas'
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-primary-500 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                <HardDrive size={18} />
                <span>Mi Unidad</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-300 cursor-not-allowed">
                <Users size={18} />
                <span>Compartido</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-300 cursor-not-allowed">
                <Clock size={18} />
                <span>Recientes</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-300 cursor-not-allowed">
                <Star size={18} />
                <span>Destacados</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-300 cursor-not-allowed">
                <Trash2 size={18} />
                <span>Papelera</span>
              </button>
            </div>
          </div>

          {/* Storage status */}
          <div className="p-3.5 bg-primary-50 rounded-2xl border border-primary-100 space-y-2">
            <div className="flex items-center gap-2 text-primary-500 text-xs font-semibold">
              <HardDrive size={14} />
              <span>Almacenamiento</span>
            </div>
            <div className="h-1.5 bg-primary-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full" style={{ width: `${Math.max(1, parseFloat(sizePercentage) * 1000)}%` }} />
            </div>
            <p className="text-[10px] text-primary-500 font-bold">
              {totalSizeStr} de 15 GB usados
            </p>
          </div>
        </div>

        {/* Main Drive Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Workspace Toolbar */}
          <div className="flex items-center justify-between border-b border-primary-100 px-6 py-4 shrink-0 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar archivos o carpetas..."
                className="w-full pl-10 pr-4 py-2 bg-primary-50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-primary-300 text-primary-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                title={viewMode === 'grid' ? 'Ver como lista' : 'Ver como cuadrícula'}
              >
                {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
              </button>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`p-2 rounded-lg transition-colors ${showRightPanel ? 'bg-primary-100 text-primary-700' : 'text-primary-500 hover:bg-primary-50'}`}
                title="Ver detalles"
              >
                <Info size={20} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="md:hidden p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                title="Nuevo"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Breadcrumbs and navigation path */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-primary-50 bg-primary-50/10 shrink-0 text-sm font-semibold">
            <span 
              className="text-primary-500 hover:text-primary-700 cursor-pointer"
              onClick={() => { setActiveCategory('Todas'); setSelectedFile(null) }}
            >
              Mi Unidad
            </span>
            {activeCategory !== 'Todas' && (
              <>
                <ChevronRight size={14} className="text-primary-300" />
                <span className="text-primary-800">{activeCategory}</span>
              </>
            )}
          </div>

          {/* Scrollable workspace items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Folders grid */}
                {activeCategory === 'Todas' && !search && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary-400 font-secondary ml-1">Carpetas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {FOLDERS.map(f => (
                        <div
                          key={f.name}
                          onClick={() => { setActiveCategory(f.name); setSelectedFile(null) }}
                          className="flex items-center gap-3 p-4 bg-white border border-primary-100 rounded-2xl hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all group"
                        >
                          <div className={`p-3 rounded-xl ${f.color.split(' ')[0]} ${f.color.split(' ')[1]} transition-colors`}>
                            <Folder size={20} className="fill-current" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-primary-700 truncate group-hover:text-primary-800">{f.name}</p>
                            <p className="text-[10px] text-primary-400 font-bold">{getFileCount(f.name)} archivos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-400 font-secondary ml-1">
                    {activeCategory === 'Todas' ? (search ? 'Resultados de búsqueda' : 'Archivos sueltos') : 'Archivos'}
                  </h3>

                  {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-primary-300 bg-primary-50/20 rounded-2xl border border-dashed border-primary-200">
                      <ImageIcon size={48} strokeWidth={1.5} />
                      <p className="mt-3 font-secondary text-sm">No se encontraron archivos en este directorio</p>
                      <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Cargar primera placa
                      </Button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedFile(item)}
                          className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all group ${
                            selectedFile?.id === item.id 
                              ? 'border-primary-600 ring-2 ring-primary-500/20 shadow' 
                              : 'border-primary-100 hover:border-primary-300 hover:shadow-sm'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative h-36 bg-primary-50 flex items-center justify-center overflow-hidden">
                            <img 
                              src={item.url} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=400&q=80'
                              }}
                            />
                          </div>
                          {/* Detail bar */}
                          <div className="p-3 flex items-center justify-between gap-2 border-t border-primary-50 bg-white">
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                              <ImageIcon size={14} className="text-primary-400 shrink-0" />
                              <p className="text-xs font-bold text-primary-700 truncate">{item.title}</p>
                            </div>
                            <span className="text-[9px] font-mono text-primary-400 shrink-0 font-bold">{item.size || '1.0 MB'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // List View (Drive table row)
                    <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-primary-50/50 border-b border-primary-100 text-primary-500 font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Carpeta</th>
                            <th className="px-4 py-3 hidden md:table-cell">Tamaño</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map(item => (
                            <tr
                              key={item.id}
                              onClick={() => setSelectedFile(item)}
                              className={`border-b border-primary-50 hover:bg-primary-50/50 cursor-pointer transition-colors ${
                                selectedFile?.id === item.id ? 'bg-primary-100/50' : ''
                              }`}
                            >
                              <td className="px-4 py-3 font-bold text-primary-700 flex items-center gap-2.5 min-w-0">
                                <ImageIcon size={14} className="text-primary-400 shrink-0" />
                                <span className="truncate">{item.title}</span>
                              </td>
                              <td className="px-4 py-3 text-primary-500 hidden sm:table-cell font-semibold">
                                {item.category}
                              </td>
                              <td className="px-4 py-3 text-primary-400 hidden md:table-cell font-mono">
                                {item.size || '1.0 MB'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleCopy(item.id, item.url)}
                                    className="p-1.5 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition-colors"
                                    title="Copiar Link"
                                  >
                                    {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                                  </button>
                                  <button
                                    onClick={() => setPreviewImage(item)}
                                    className="p-1.5 bg-primary-50 text-primary-500 hover:bg-primary-100 rounded-lg transition-colors"
                                    title="Ver imagen"
                                  >
                                    <ExternalLink size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        {showRightPanel && (
          <div className="hidden lg:flex flex-col w-72 bg-white border-l border-primary-100 p-4 shrink-0 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-primary-100 pb-3">
              <h3 className="font-title text-base text-primary-700">Detalles</h3>
              {selectedFile && (
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="text-primary-400 hover:text-primary-600 p-1 hover:bg-primary-50 rounded"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {selectedFile ? (
              <div className="space-y-4">
                {/* Preview image */}
                <div className="relative aspect-video rounded-xl bg-primary-50 flex items-center justify-center overflow-hidden border border-primary-100">
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.title} 
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setPreviewImage(selectedFile)}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=400&q=80'
                    }}
                  />
                </div>

                {/* Title */}
                <div>
                  <h4 className="font-bold text-sm text-primary-800 break-words leading-tight">{selectedFile.title}</h4>
                  <p className="text-[10px] text-primary-400 font-mono mt-1">ID: {selectedFile.id}</p>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 border-t border-primary-50 pt-3 text-xs font-semibold text-primary-700">
                  <div className="flex justify-between">
                    <span className="text-primary-400">Tipo:</span>
                    <span>Imagen (PNG/JPG)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Carpeta:</span>
                    <span className="text-primary-800 bg-primary-100/50 px-2 py-0.5 rounded-full text-[10px] font-bold">{selectedFile.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Tamaño:</span>
                    <span className="font-mono">{selectedFile.size || '1.0 MB'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Subido el:</span>
                    <span>{new Date(selectedFile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t border-primary-50 pt-4">
                  <button
                    onClick={() => handleCopy(selectedFile.id, selectedFile.url)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      copiedId === selectedFile.id 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    }`}
                  >
                    {copiedId === selectedFile.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === selectedFile.id ? '¡Enlace copiado!' : 'Copiar enlace directo'}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewImage(selectedFile)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl text-xs font-bold transition-all"
                    >
                      <ExternalLink size={14} />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(selectedFile.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition-all"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-primary-300 font-secondary text-xs text-center">
                <ImageIcon size={32} className="text-primary-200 mb-2" strokeWidth={1.5} />
                <span>Selecciona un archivo de la cuadrícula o lista para ver sus detalles y acciones rápidas.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Image Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm() }} title="Cargar Placa / Imagen">
        <form onSubmit={handleAdd} className="space-y-4">
          {/* Upload Method Tabs */}
          <div className="flex gap-1.5 p-1 bg-primary-50 rounded-xl border border-primary-100">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                uploadMode === 'file'
                  ? 'bg-white text-primary-800 shadow-sm border border-primary-100'
                  : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              📁 Subir Archivo
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                uploadMode === 'url'
                  ? 'bg-white text-primary-800 shadow-sm border border-primary-100'
                  : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              🔗 Pegar Enlace URL
            </button>
          </div>

          <Input 
            label="Nombre de la placa o recurso" 
            value={form.title} 
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Ej: Promo Dia del Padre Feed.png" 
            required 
          />

          {uploadMode === 'file' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Archivo a Subir</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragOver 
                    ? 'border-primary-600 bg-primary-50/50' 
                    : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50/20'
                }`}
                onClick={() => document.getElementById('media-file-input').click()}
              >
                <input
                  id="media-file-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                {form.filePreview ? (
                  <div className="space-y-2 text-center w-full">
                    <div className="h-32 w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-primary-50 border border-primary-100 flex items-center justify-center">
                      <img src={form.filePreview} alt="Vista previa" className="max-h-full object-contain" />
                    </div>
                    <p className="text-xs text-primary-500 font-semibold truncate max-w-xs mx-auto">{form.file?.name}</p>
                    <span className="text-[10px] text-primary-400 font-bold block">{form.size}</span>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-primary-50 rounded-full text-primary-400 w-fit mx-auto">
                      <Plus size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-600">Haz clic para elegir un archivo o arrástralo aquí</p>
                      <p className="text-[10px] text-primary-400 font-medium mt-0.5">Soporta imágenes y videos de hasta 200MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Input 
                label="URL de la imagen o diseño" 
                value={form.url} 
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                placeholder="https://images.unsplash.com/..." 
                required 
              />
              <Input 
                label="Peso estimado" 
                value={form.size} 
                onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                placeholder="Ej: 1.5 MB" 
              />
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1 mb-1.5">Carpeta de Destino</label>
            <select 
              value={form.category} 
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
            >
              {FOLDERS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button type="submit" loading={uploading}>
              {uploading ? 'Subiendo...' : 'Cargar Archivo'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowAddModal(false); resetForm() }} disabled={uploading}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* Preview Fullscreen Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.title || 'Visualización'}>
        {previewImage && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="max-h-[60vh] w-full rounded-xl overflow-hidden bg-primary-50 flex items-center justify-center border border-primary-100">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
            <div className="w-full flex items-center justify-between gap-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-primary-400 block font-secondary">Carpeta</span>
                <span className="text-xs font-bold text-primary-700">{previewImage.category}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-primary-400 block font-secondary">Peso estimado</span>
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
