import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export function useSuppliers(search = '') {
  return useQuery({
    queryKey: ['suppliers', search],
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select('*')
        .order('name')

      if (search) {
        query = query.or(`name.ilike.%${search}%,cuit.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useSupplier(id) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          supplier_products(
            *,
            product:products(id, name, sku, sell_price)
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (supplier) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Proveedor creado')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...supplier }) => {
      const { error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['supplier'] })
      toast.success('Proveedor actualizado')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Proveedor eliminado')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}
