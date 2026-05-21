import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 md:pt-16 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`relative w-full ${sizes[size] || sizes.md} bg-white rounded-2xl shadow-2xl border border-primary-200 animate-fade-in mb-8`}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-primary-100 bg-white rounded-t-2xl">
          <h3 className="font-title text-2xl text-primary-600 uppercase tracking-wider">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
