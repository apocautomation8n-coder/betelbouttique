export default function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-widest text-primary-500 font-secondary ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className="block w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent placeholder-primary-300 text-primary-600"
      />
    </div>
  )
}
