import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

// Default media item mocks for initial content
const DEFAULT_MEDIA = [
  {
    id: 'm1',
    title: 'Remera Fe - Beige Oversize',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    size: '1.2 MB',
    category: 'Remeras',
    created_at: new Date().toISOString()
  },
  {
    id: 'm2',
    title: 'Buzo Hoodie Grace - Negro',
    url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    size: '2.4 MB',
    category: 'Buzos',
    created_at: new Date().toISOString()
  },
  {
    id: 'm3',
    title: 'Gorra Cross Faith - Premium',
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    size: '850 KB',
    category: 'Gorras',
    created_at: new Date().toISOString()
  },
  {
    id: 'm4',
    title: 'Banner Lanzamiento Colección Invierno',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    size: '4.1 MB',
    category: 'Banners',
    created_at: new Date().toISOString()
  }
]

export function useMedia() {
  const qc = useQueryClient()

  // We read from Supabase, but fallback to LocalStorage/Default mocks if table doesn't exist yet
  const query = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('media_library')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return data.length > 0 ? data : DEFAULT_MEDIA
      } catch (err) {
        console.warn('Usando base de datos local para la galería de imágenes:', err.message)
        const local = localStorage.getItem('betel_media_library')
        if (local) {
          return JSON.parse(local)
        }
        localStorage.setItem('betel_media_library', JSON.stringify(DEFAULT_MEDIA))
        return DEFAULT_MEDIA
      }
    }
  })

  const uploadMutation = useMutation({
    mutationFn: async (newItem) => {
      try {
        // Try inserting into Supabase
        const { data, error } = await supabase
          .from('media_library')
          .insert(newItem)
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (err) {
        // Local fallback
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
