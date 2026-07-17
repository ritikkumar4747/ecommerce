import { Link } from 'react-router-dom'
import { useContext, useState } from 'react'
import { AuthContext } from '../context/Authcontext'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950/70 backdrop-blur-md border-b border-white/5">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="hover:opacity-85 transition" onClick={handleClose}>
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm tracking-widest text-gray-300">
          <Link to="/products" className="hover:text-white transition">PRODUCTS</Link>
          {user && <Link to="/cart" className="hover:text-white transition">CART</Link>}
          {user && <Link to="/orders" className="hover:text-white transition">ORDERS</Link>}
          {user && <Link to="/profile" className="hover:text-white transition">PROFILE</Link>}
          {user && user.role === 'seller' && (
            <Link to="/seller/dashboard" className="hover:text-amber-400 text-amber-500 font-semibold transition">SELLER PANEL</Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin/products" className="hover:text-amber-400 text-amber-500 font-semibold transition">ADMIN PANEL</Link>
          )}
        </div>

        {/* CTA / Mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-200">{user.email}</span>
                <button onClick={logout} className="text-sm px-3 py-1 border border-white/30 text-white">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm px-3 py-1 border border-white/30 text-white">Login</Link>
                <Link to="/register" className="text-sm px-3 py-1 bg-white text-black">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded bg-white/5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden bg-zinc-950/95 border-t border-white/5">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link to="/products" onClick={handleClose} className="block text-white px-2 py-2">Products</Link>
            {user && <Link to="/cart" onClick={handleClose} className="block text-white px-2 py-2">Cart</Link>}
            {user && <Link to="/orders" onClick={handleClose} className="block text-white px-2 py-2">Orders</Link>}
            {user && <Link to="/profile" onClick={handleClose} className="block text-white px-2 py-2">Profile</Link>}
            {!user && <Link to="/login" onClick={handleClose} className="block text-white px-2 py-2">Login</Link>}
            {!user && <Link to="/register" onClick={handleClose} className="block text-white px-2 py-2">Register</Link>}
            {user && (
              <button onClick={() => { logout(); handleClose(); }} className="w-full text-left text-white px-2 py-2">Logout</button>
            )}
            {user && user.role === 'seller' && (
              <Link to="/seller/dashboard" onClick={handleClose} className="block text-amber-400 px-2 py-2">Seller Panel</Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin/products" onClick={handleClose} className="block text-amber-400 px-2 py-2">Admin Panel</Link>
            )}
          </div>
        </div>
      )}

    </nav>
  );
}