import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-600',
      light: 'bg-primary-100',
      text: 'text-primary-600',
      icon: 'text-primary-100'
    },
    green: {
      bg: 'bg-emerald-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      icon: 'text-emerald-100'
    },
    red: {
      bg: 'bg-red-500',
      light: 'bg-red-50',
      text: 'text-red-500',
      icon: 'text-red-100'
    },
    amber: {
      bg: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-600',
      icon: 'text-amber-100'
    },
    blue: {
      bg: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-100'
    }
  }

  const c = colorMap[color] || colorMap.primary

  return (
    <div className="bg-white rounded-2xl p-5 border border-primary-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`${c.bg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon size={22} className={c.icon} />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="font-title text-3xl tracking-wide text-primary-800 leading-none">
        {value}
      </h3>
      <p className="text-xs font-secondary uppercase tracking-widest text-primary-400 mt-1.5">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-primary-400 mt-1 font-secondary">{subtitle}</p>
      )}
    </div>
  )
}
