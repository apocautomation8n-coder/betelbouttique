import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Truck, DollarSign, MessageSquare, Users, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const LG_MEDIA = '(min-width: 1024px)'

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(LG_MEDIA)

    const sync = () => setIsSidebarOpen(mq.matches)
    sync()

    if (mq.addEventListener) mq.addEventListener('change', sync)
    else mq.addListener(sync)

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', sync)
      else mq.removeListener(sync)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(LG_MEDIA)
    if (!mq.matches) setIsSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/productos', icon: Package, label: 'Productos' },
    { to: '/proveedores', icon: Truck, label: 'Proveedores' },
    { to: '/finanzas', icon: DollarSign, label: 'Finanzas' },
    { to: '/mensajes', icon: MessageSquare, label: 'Mensajes' },
    { to: '/contactos', icon: Users, label: 'Contactos' },
  ]

  return (
    <div className="flex min-h-screen h-[100dvh] bg-primary-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary-600 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-8 text-center">
            <h1 className="font-logo text-2xl tracking-tighter text-primary-100">
              Betel
            </h1>
            <p className="font-title text-sm uppercase tracking-widest text-primary-200 mt-[-4px]">
              BOUTTIQUE
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-primary-300 mt-1 font-secondary">
              Ropa Cristiana ✝️
            </p>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-100 text-primary-600 font-bold shadow-lg shadow-black/20' 
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-secondary uppercase tracking-wider text-xs">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-primary-500/30 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-primary-200 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-secondary uppercase tracking-wider text-xs">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar for Mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-primary-200">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-primary-600">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-center">
            <h1 className="font-logo text-lg tracking-tighter text-primary-600">Betel</h1>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
