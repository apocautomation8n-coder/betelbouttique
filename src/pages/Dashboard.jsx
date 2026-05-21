import { useState } from 'react'
import { Package, AlertTriangle, DollarSign, TrendingUp, ShoppingBag, Truck, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import { useProductStats } from '../hooks/useProducts'
import { useFinanceSummary, useYearlySummary } from '../hooks/useFinance'
import { useSuppliers } from '../hooks/useSuppliers'
import { formatARSCompact, getMonthName } from '../lib/formatters'

export default function Dashboard() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth())

  const { data: productStats } = useProductStats()
  const { summary } = useFinanceSummary(year, month)
  const { data: suppliers } = useSuppliers()
  const { data: yearlyData } = useYearlySummary(year)

  const stats = productStats || { total: 0, active: 0, lowStock: 0, totalValue: 0 }

  // Max value for chart scaling
  const maxVal = yearlyData
    ? Math.max(...yearlyData.map(m => Math.max(m.income, m.expense)), 1)
    : 1

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-title text-4xl md:text-5xl text-primary-800 tracking-wide">Dashboard</h1>
          <p className="text-sm text-primary-400 font-secondary mt-1">
            {getMonthName(month)} {year} — Betel Boutique
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="glass rounded-xl px-4 py-2 text-sm text-primary-500 font-secondary flex items-center gap-1.5 shadow-sm">
            💵 <span className="font-bold text-emerald-700">En Caja:</span> {formatARSCompact(
              (() => {
                if (typeof window === 'undefined') return 0
                const saved = localStorage.getItem('betel_cash_register')
                return saved ? Number(saved) : 0
              })()
            )}
          </div>
          <div className="glass rounded-xl px-4 py-2 text-sm text-primary-500 font-secondary shadow-sm">
            ✝️ <span className="font-bold text-primary-700">Ropa Cristiana</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock Total (Unid.)"
          value={stats.totalStockUnits || 0}
          subtitle={`${stats.total} productos (${stats.active} act.)`}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStock}
          subtitle="Variantes con alerta"
          icon={AlertTriangle}
          color={stats.lowStock > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatARSCompact(summary.income)}
          subtitle={`${summary.count} transacciones`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Egresos del Mes"
          value={formatARSCompact(summary.expense)}
          icon={ArrowDownRight}
          color="red"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profit Card */}
        <div className={`rounded-2xl p-6 border shadow-sm ${
          summary.profit >= 0
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200'
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${summary.profit >= 0 ? 'bg-emerald-600' : 'bg-red-500'}`}>
              <DollarSign size={20} className="text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400 font-secondary">
              Resultado del mes
            </span>
          </div>
          <p className={`font-title text-4xl tracking-wide ${summary.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatARSCompact(summary.profit)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {summary.profit >= 0
              ? <ArrowUpRight size={14} className="text-emerald-600" />
              : <ArrowDownRight size={14} className="text-red-500" />
            }
            <span className={`text-xs font-bold ${summary.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {summary.income > 0 ? ((summary.profit / summary.income) * 100).toFixed(1) : 0}% margen neto
            </span>
          </div>
        </div>

        {/* Valor en Stock */}
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2.5 rounded-xl">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400 font-secondary">
              Valor en stock
            </span>
          </div>
          <p className="font-title text-4xl tracking-wide text-primary-800">
            {formatARSCompact(stats.totalValue)}
          </p>
          <p className="text-xs text-primary-400 mt-2 font-secondary">
            Valorado a precio de venta
          </p>
        </div>

        {/* Proveedores */}
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-500 p-2.5 rounded-xl">
              <Truck size={20} className="text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400 font-secondary">
              Proveedores
            </span>
          </div>
          <p className="font-title text-4xl tracking-wide text-primary-800">
            {suppliers?.length || 0}
          </p>
          <p className="text-xs text-primary-400 mt-2 font-secondary">
            {suppliers?.filter(s => s.is_active).length || 0} activos
          </p>
        </div>
      </div>

      {/* Yearly Chart */}
      <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
        <h3 className="font-title text-xl uppercase tracking-wider text-primary-600 mb-4">
          Resumen Anual {year}
        </h3>
        <div className="flex items-end gap-1.5 h-48">
          {yearlyData?.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '160px' }}>
                {/* Income bar */}
                <div
                  className="w-2/5 bg-emerald-400 rounded-t-md transition-all duration-500 group-hover:bg-emerald-500 min-h-[2px]"
                  style={{ height: `${Math.max((m.income / maxVal) * 100, 1)}%` }}
                  title={`Ingresos: ${formatARSCompact(m.income)}`}
                />
                {/* Expense bar */}
                <div
                  className="w-2/5 bg-red-300 rounded-t-md transition-all duration-500 group-hover:bg-red-400 min-h-[2px]"
                  style={{ height: `${Math.max((m.expense / maxVal) * 100, 1)}%` }}
                  title={`Egresos: ${formatARSCompact(m.expense)}`}
                />
              </div>
              <span className={`text-[9px] font-bold uppercase ${i === month ? 'text-primary-700' : 'text-primary-300'}`}>
                {getMonthName(i).substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-xs text-primary-500 font-secondary">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-300" />
            <span className="text-xs text-primary-500 font-secondary">Egresos</span>
          </div>
        </div>
      </div>

      {/* Categories breakdown */}
      {summary.byCategory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
          <h3 className="font-title text-xl uppercase tracking-wider text-primary-600 mb-4">
            Desglose por Categoría — {getMonthName(month)}
          </h3>
          <div className="space-y-3">
            {summary.byCategory.map((cat, i) => {
              const pct = summary.income > 0 || summary.expense > 0
                ? (cat.total / (cat.type === 'income' ? summary.income : summary.expense) * 100)
                : 0
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-primary-700">{cat.name}</span>
                      <span className={`text-sm font-bold ${cat.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatARSCompact(cat.total)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${cat.type === 'income' ? 'bg-emerald-400' : 'bg-red-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-primary-400 w-12 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
