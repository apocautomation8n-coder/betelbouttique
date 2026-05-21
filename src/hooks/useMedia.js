import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

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

export function useMedia() {
  const qc = useQueryClient()

  const getDeletedDefaults = () => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('betel_deleted_media_ids')
    return saved ? JSON.parse(saved) : []
  }

  const query = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const deletedIds = getDeletedDefaults()
      const activeDefaults = DEFAULT_MEDIA.filter(item => !deletedIds.includes(item.id))

      try {
        const { data, error } = await supabase
          .from('media_library')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Merge database items with non-deleted mock defaults
        const dbIds = new Set(data.map(item => item.id))
        const filteredDefaults = activeDefaults.filter(item => !dbIds.has(item.id))
        return [...data, ...filteredDefaults]
      } catch (err) {
        console.warn('Usando base de datos local para la galería de imágenes:', err.message)
        const local = localStorage.getItem('betel_media_library')
        
        let items = []
        if (local) {
          items = JSON.parse(local)
        } else {
          items = [...DEFAULT_MEDIA]
          localStorage.setItem('betel_media_library', JSON.stringify(DEFAULT_MEDIA))
        }

        // Filter out deleted defaults
        return items.filter(item => !deletedIds.includes(item.id))
      }
    }
  })

  const uploadMutation = useMutation({
    mutationFn: async (newItem) => {
      try {
        const { data, error } = await supabase
          .from('media_library')
          .insert(newItem)
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (err) {
        const local = localStorage.getItem('betel_media_library')
        const items = local ? JSON.parse(local) : [...DEFAULT_MEDIA]
        const createdItem = {
          id: 'local_' + Math.random().toString(36).substr(2, 9),
          ...newItem,
          created_at: new Date().toISOString()
        }
        items.unshift(createdItem)
        localStorage.setItem('betel_media_library', JSON.stringify(items))
        return createdItem
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Imagen guardada en la galería')
    },
    onError: (err) => toast.error('Error al guardar: ' + err.message)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // If it is a default item (id starting with 'm'), record it as deleted
      if (id.startsWith('m')) {
        const deleted = getDeletedDefaults()
        if (!deleted.includes(id)) {
          localStorage.setItem('betel_deleted_media_ids', JSON.stringify([...deleted, id]))
        }
      }

      try {
        const { error } = await supabase
          .from('media_library')
          .delete()
          .eq('id', id)
        if (error) throw error
      } catch (err) {
        // Local fallback
        const local = localStorage.getItem('betel_media_library')
        if (local) {
          const items = JSON.parse(local).filter(item => item.id !== id)
          localStorage.setItem('betel_media_library', JSON.stringify(items))
        }
      }
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
