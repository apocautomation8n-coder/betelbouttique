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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div className={`relative w-full ${sizes[size] || sizes.md} max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-primary-100 animate-fade-in flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-100 bg-white shrink-0">
          <h3 className="font-title text-2xl text-primary-700 uppercase tracking-wider">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}

