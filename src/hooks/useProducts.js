import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

// ─── Categorías ───
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    }
  })
}

// ─── Productos ───
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, icon),
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false })

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, icon),
          variants:product_variants(*)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ product, variants }) => {
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (prodErr) throw prodErr

      if (variants && variants.length > 0) {
        const variantsWithProduct = variants.map(v => ({
          ...v,
          product_id: prod.id
        }))
        const { error: varErr } = await supabase
          .from('product_variants')
          .insert(variantsWithProduct)
        if (varErr) throw varErr
      }

      return prod
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, product, variants }) => {
      const { error: prodErr } = await supabase
        .from('products')
        .update({ ...product, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (prodErr) throw prodErr

      if (variants) {
        // Delete old variants and insert new ones
        await supabase.from('product_variants').delete().eq('product_id', id)
        if (variants.length > 0) {
          const variantsWithProduct = variants.map(v => ({
            ...v,
            product_id: id
          }))
          const { error: varErr } = await supabase
            .from('product_variants')
            .insert(variantsWithProduct)
          if (varErr) throw varErr
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
      toast.success('Producto actualizado')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto eliminado')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

export function useUpdateStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ variantId, stock }) => {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock })
        .eq('id', variantId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
    }
  })
}

// ─── Stats rápidos ───
export function useProductStats() {
  return useQuery({
    queryKey: ['product-stats'],
    queryFn: async () => {
      const { data: products } = await supabase
        .from('products')
        .select('id, status, sell_price, cost_price, variants:product_variants(stock, min_stock)')

      if (!products) return { total: 0, active: 0, lowStock: 0, totalValue: 0, totalStockUnits: 0 }

      let lowStock = 0
      let totalValue = 0
      let totalStockUnits = 0

      products.forEach(p => {
        if (p.variants) {
          p.variants.forEach(v => {
            totalValue += (v.stock || 0) * (p.sell_price || 0)
            totalStockUnits += (v.stock || 0)
            if (v.stock <= v.min_stock) lowStock++
          })
        }
      })

      return {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        lowStock,
        totalValue,
        totalStockUnits
      }
    }
  })
}
