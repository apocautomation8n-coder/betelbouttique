import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'betel_media_library'
const DELETED_KEY = 'betel_deleted_media_ids'

// Default media items mock for initial content
const DEFAULT_MEDIA = [
  {
    id: 'm1',
    title: 'Post de Instagram — Nueva Temporada.jpg',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    size: '1.2 MB',
    category: 'Instagram Feed',
    created_at: new Date().toISOString()
  },
  {
    id: 'm2',
    title: 'Story de Instagram — Oferta Invierno.png',
    url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    size: '2.4 MB',
    category: 'Instagram Stories',
    created_at: new Date().toISOString()
  },
  {
    id: 'm3',
    title: 'Facebook Ads — Promo 20 Off.jpg',
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    size: '850 KB',
    category: 'Facebook & Meta Ads',
    created_at: new Date().toISOString()
  },
  {
    id: 'm4',
    title: 'Banner Web — Envío Gratis.jpg',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    size: '4.1 MB',
    category: 'Banners Web',
    created_at: new Date().toISOString()
  }
]

function getDeletedIds() {
  try {
    const saved = localStorage.getItem(DELETED_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function getStoredItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function saveStoredItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useMedia() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const deletedIds = getDeletedIds()
      const userItems = getStoredItems()
      const activeDefaults = DEFAULT_MEDIA.filter(item => !deletedIds.includes(item.id))

      // User-uploaded items first (newest first), then defaults
      const allIds = new Set(userItems.map(i => i.id))
      const uniqueDefaults = activeDefaults.filter(i => !allIds.has(i.id))

      return [...userItems, ...uniqueDefaults]
    }
  })

  const uploadMutation = useMutation({
    mutationFn: async (newItem) => {
      const createdItem = {
        id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...newItem,
        created_at: new Date().toISOString()
      }
      const items = getStoredItems()
      items.unshift(createdItem)
      saveStoredItems(items)
      return createdItem
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Imagen guardada en la galería')
    },
    onError: (err) => toast.error('Error al guardar: ' + err.message)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // If it is a default item, record it as deleted
      if (id.startsWith('m')) {
        const deleted = getDeletedIds()
        if (!deleted.includes(id)) {
          localStorage.setItem(DELETED_KEY, JSON.stringify([...deleted, id]))
        }
      }
      // Remove from stored items
      const items = getStoredItems().filter(item => item.id !== id)
      saveStoredItems(items)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Imagen eliminada')
    },
    onError: (err) => toast.error('Error al eliminar: ' + err.message)
  })

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteItem: deleteMutation.mutateAsync
  }
}
