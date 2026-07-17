import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/Authcontext'

export default function SellerRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div className="p-8 text-center text-white bg-zinc-950 min-h-screen pt-32">Loading authentication...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'seller' && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
