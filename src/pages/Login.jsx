import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import { LogIn, Lock, User } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Bienvenido a Betel Bouttique')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-100 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-primary-200 animate-fade-in">
        <div className="text-center">
          <h1 className="font-logo text-5xl text-primary-600 tracking-tight font-black leading-none">
            Betel
          </h1>
          <p className="font-secondary text-sm text-primary-400 uppercase tracking-[0.35em] mt-1">
            BOUTTIQUE
          </p>
          <h2 className="mt-6 text-sm font-secondary text-primary-500 uppercase tracking-widest">
            Panel de Gestión
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-xl leading-5 bg-primary-50 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-xl leading-5 bg-primary-50 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cargando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={18} />
                ENTRAR
              </span>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-primary-400 font-secondary tracking-wider">
            &copy; 2026 BETEL BOUTTIQUE SOFT
          </p>
        </div>
      </div>
    </div>
  )
}
