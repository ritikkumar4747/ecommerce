import React, { useContext } from 'react'
import Api from '../services/Api'
import { AuthContext } from '../context/Authcontext'

export default function QuickView({ product, open, onClose }){
  const { user } = useContext(AuthContext);

  if(!open) return null

  const addToCart = async () => {
    try {
      await Api.post('/cart/add', { productId: product._id, quantity: 1 })
      alert('Added to cart successfully')
      onClose()
    } catch (err) {
      console.error('add to cart', err)
      if (!user) alert('Please login to add to cart')
      else alert(err?.response?.data?.error || 'Failed to add')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition text-2xl cursor-pointer">
          &times;
        </button>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-64 flex items-center justify-center">
            <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
          </div>
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-light tracking-wide text-zinc-100">{product.name}</h3>
              <div className="text-xl font-semibold text-zinc-300">₹{product.price.toLocaleString()}</div>
              <p className="text-xs text-zinc-400 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded w-fit">{product.category}</p>
              <p className="text-sm text-zinc-400 leading-relaxed max-h-32 overflow-y-auto pr-1">{product.description}</p>
            </div>
            
            <div className="pt-6">
              <button onClick={addToCart} className="w-full py-3 bg-white text-black font-semibold text-sm tracking-widest hover:bg-zinc-200 transition rounded-lg cursor-pointer">
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
