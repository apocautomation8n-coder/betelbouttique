import { useState } from 'react'
import { Plus, Search, Filter, Package } from 'lucide-react'
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts'
import ProductCard from '../components/products/ProductCard'
import ProductForm from '../components/products/ProductForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

export default function Products() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const filters = {}
  if (search) filters.search = search
  if (categoryFilter) filters.category_id = categoryFilter
  if (statusFilter) filters.status = statusFilter

  const { data: products, isLoading } = useProducts(filters)
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  // Extraer colores únicos de las variantes de los productos cargados
  const uniqueColors = Array.from(
    new Set(
      products?.flatMap(p => p.variants?.map(v => v.color?.trim()).filter(Boolean)) || []
    )
  ).sort()

  // Filtrar los productos por el color seleccionado
  const filteredProducts = products?.filter(product => {
    if (colorFilter) {
      return product.variants?.some(v => v.color?.toLowerCase().trim() === colorFilter.toLowerCase().trim())
    }
    return true
  })

  const handleSubmit = async (data) => {
    if (editing) {
      await updateProduct.mutateAsync({ id: editing.id, ...data })
    } else {
      await createProduct.mutateAsync(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleEdit = (product) => {
    setEditing(product)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este producto?')) {
      await deleteProduct.mutateAsync(id)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Productos</h1>
          <p className="text-sm text-primary-400 font-secondary mt-1">
            {products?.length || 0} productos en catálogo
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={18} /> Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder-primary-300 text-primary-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
        >
          <option value="">Todas las categorías</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
        >
          <option value="">Todos los estados</option>
          <option value="active">✅ Activo</option>
          <option value="inactive">⏸️ Inactivo</option>
          <option value="out_of_stock">❌ Agotado</option>
        </select>
        <select
          value={colorFilter}
          onChange={e => setColorFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600"
        >
          <option value="">Todos los colores</option>
          {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary-300">
          <Package size={48} strokeWidth={1.5} />
          <p className="mt-3 font-secondary text-sm">No hay productos con estas especificaciones</p>
          <Button className="mt-4" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus size={16} /> Crear primer producto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          loading={createProduct.isPending || updateProduct.isPending}
        />
      </Modal>
    </div>
  )
}
