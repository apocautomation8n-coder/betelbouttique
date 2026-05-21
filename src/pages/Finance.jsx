import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, Trash2, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'
import { useTransactions, useTransactionCategories, useCreateTransaction, useDeleteTransaction, useFinanceSummary } from '../hooks/useFinance'
import { useSuppliers } from '../hooks/useSuppliers'
import { formatARS, formatARSCompact, formatDate, getMonthName, getMonthRange } from '../lib/formatters'
import TransactionForm from '../components/finance/TransactionForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const PAYMENT_LABELS = {
  cash: '💵 Efectivo',
  transfer: '🏦 Transferencia',
  card: '💳 Tarjeta',
  mercadopago: '📱 MercadoPago',
  other: '📋 Otro',
}

export default function Finance() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [tab, setTab] = useState('all') // all | income | expense
  const [showForm, setShowForm] = useState(null) // null | 'income' | 'expense'

  const { start, end } = useMemo(() => getMonthRange(year, month), [year, month])
  const { data: transactions, isLoading } = useTransactions({ type: tab === 'all' ? undefined : tab, start, end })
  const { data: categories } = useTransactionCategories()
  const { data: suppliers } = useSuppliers()
  const { summary } = useFinanceSummary(year, month)
  const createTx = useCreateTransaction()
  const deleteTx = useDeleteTransaction()

  const months = useMemo(() => {
    const arr = []
    for (let i = 0; i < 12; i++) arr.push({ value: i, label: getMonthName(i) })
    return arr
  }, [])

  const handleSubmit = async (data) => {
    await createTx.mutateAsync(data)
    setShowForm(null)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta transacción?')) {
      await deleteTx.mutateAsync(id)
    }
  }

  const tabs = [
    { key: 'all', label: 'Todos', icon: DollarSign },
    { key: 'income', label: 'Ingresos', icon: ArrowUpRight },
    { key: 'expense', label: 'Egresos', icon: ArrowDownRight },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Finanzas</h1>
          <p className="text-sm text-primary-400 font-secondary mt-1">Control de ingresos y egresos en ARS $</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowForm('income')} className="!bg-emerald-600 hover:!bg-emerald-700">
            <ArrowUpRight size={16} /> Ingreso
          </Button>
          <Button onClick={() => setShowForm('expense')} className="!bg-red-500 hover:!bg-red-600">
            <ArrowDownRight size={16} /> Egreso
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 font-secondary">Ingresos</span>
          </div>
          <p className="font-title text-3xl text-emerald-700 tracking-wide">{formatARSCompact(summary.income)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 font-secondary">Egresos</span>
          </div>
          <p className="font-title text-3xl text-red-600 tracking-wide">{formatARSCompact(summary.expense)}</p>
        </div>
        <div className={`rounded-2xl p-5 border ${summary.profit >= 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200' : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className={summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'} />
            <span className={`text-xs font-bold uppercase tracking-widest font-secondary ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Resultado</span>
          </div>
          <p className={`font-title text-3xl tracking-wide ${summary.profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatARSCompact(summary.profit)}</p>
        </div>
      </div>

      {/* Month filter + Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-primary-100 p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t.key ? 'bg-primary-600 text-white shadow' : 'text-primary-400 hover:text-primary-600'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600">
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 text-primary-600">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary-300">
          <DollarSign size={48} strokeWidth={1.5} />
          <p className="mt-3 font-secondary text-sm">Sin transacciones en {getMonthName(month)}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 font-secondary">Fecha</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 font-secondary">Tipo</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 font-secondary">Categoría</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 font-secondary">Descripción</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 font-secondary">Pago</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-400 font-secondary">Monto</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-primary-50 hover:bg-primary-50/30 transition-colors">
                    <td className="px-4 py-3 text-primary-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type === 'income' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary-600">{tx.category?.icon} {tx.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-primary-500 max-w-[200px] truncate">{tx.description || '-'}</td>
                    <td className="px-4 py-3 text-xs text-primary-400">{PAYMENT_LABELS[tx.payment_method] || tx.payment_method}</td>
                    <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatARS(tx.amount)}
                    </td>
                    <td className="px-2">
                      <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modals */}
      <Modal isOpen={showForm === 'income'} onClose={() => setShowForm(null)} title="Registrar Ingreso">
        <TransactionForm type="income" categories={categories} suppliers={suppliers} onSubmit={handleSubmit} onCancel={() => setShowForm(null)} loading={createTx.isPending} />
      </Modal>
      <Modal isOpen={showForm === 'expense'} onClose={() => setShowForm(null)} title="Registrar Egreso">
        <TransactionForm type="expense" categories={categories} suppliers={suppliers} onSubmit={handleSubmit} onCancel={() => setShowForm(null)} loading={createTx.isPending} />
      </Modal>
    </div>
  )
}
