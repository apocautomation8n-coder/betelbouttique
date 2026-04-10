export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button', 
  disabled = false, 
  className = '',
  loading = false
}) {
  const baseStyles = "px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md",
    secondary: "bg-white text-primary-600 border border-primary-200 hover:bg-primary-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-primary-600 hover:bg-primary-100/50"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  )
}
