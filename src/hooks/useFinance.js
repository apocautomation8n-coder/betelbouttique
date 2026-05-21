import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getMonthRange } from '../lib/formatters'
import toast from 'react-hot-toast'

// ─── Categorías de transacción ───
export function useTransactionCategories(type) {
  return useQuery({
    queryKey: ['transaction-categories', type],
    queryFn: async () => {
      let query = supabase.from('transaction_categories').select('*').order('name')
      if (type) query = query.eq('type', type)
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

// ─── Transacciones ───
export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:transaction_categories(id, name, icon, type),
          supplier:suppliers(id, name)
        `)
        .order('date', { ascending: false })

      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters.start && filters.end) {
        query = query.gte('date', filters.start).lte('date', filters.end)
      }
      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      let transactionData = payload
      let stockUpdate = null

      if (payload.transaction) {
        transactionData = payload.transaction
        stockUpdate = payload.variantStockUpdate
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()
      if (error) throw error

      if (stockUpdate && stockUpdate.variantId && stockUpdate.quantity) {
        const { data: variant, error: getErr } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('id', stockUpdate.variantId)
          .single()
        if (!getErr && variant) {
          const newStock = Math.max(0, (variant.stock || 0) - stockUpdate.quantity)
          const { error: updErr } = await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', stockUpdate.variantId)
          if (updErr) throw updErr
        }
      }
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['finance-summary'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product-stats'] })
      toast.success('Transacción registrada')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['finance-summary'] })
      toast.success('Transacción eliminada')
    },
    onError: (err) => toast.error('Error: ' + err.message)
  })
}

// ─── Resumen financiero del mes ───
export function useFinanceSummary(year, month) {
  const { start, end } = getMonthRange(year, month)

  const { data: transactions, ...rest } = useTransactions({ start, end })

  const summary = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, profit: 0, count: 0, byCategory: [] }

    let income = 0
    let expense = 0
    const catMap = {}

    transactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount)
      else expense += Number(t.amount)

      const catName = t.category?.name || 'Sin categoría'
      const catIcon = t.category?.icon || '📋'
      if (!catMap[catName]) catMap[catName] = { name: catName, icon: catIcon, type: t.type, total: 0, count: 0 }
      catMap[catName].total += Number(t.amount)
      catMap[catName].count++
    })

    return {
      income,
      expense,
      profit: income - expense,
      count: transactions.length,
      byCategory: Object.values(catMap).sort((a, b) => b.total - a.total)
    }
  }, [transactions])

  return { ...rest, data: transactions, summary }
}

// ─── Resumen anual ───
export function useYearlySummary(year) {
  return useQuery({
    queryKey: ['yearly-summary', year],
    queryFn: async () => {
      const startOfYear = new Date(year, 0, 1).toISOString()
      const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString()

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .gte('date', startOfYear)
        .lte('date', endOfYear)

      if (error) throw error

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        income: 0,
        expense: 0
      }))

      data?.forEach(t => {
        const m = new Date(t.date).getMonth()
        if (t.type === 'income') months[m].income += Number(t.amount)
        else months[m].expense += Number(t.amount)
      })

      return months
    }
  })
}
