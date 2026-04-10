export default function Toggle({ enabled, onChange, label }) {
  return (
    <label className="inline-flex items-center cursor-pointer group">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={enabled} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className={`
          block w-10 h-6 rounded-full transition-all duration-200
          ${enabled ? 'bg-primary-600' : 'bg-primary-200'}
        `}></div>
        <div className={`
          absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200
          ${enabled ? 'translate-x-4' : 'translate-x-0'}
        `}></div>
      </div>
      {label && (
        <span className="ml-3 text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary">
          {label}
        </span>
      )}
    </label>
  )
}
