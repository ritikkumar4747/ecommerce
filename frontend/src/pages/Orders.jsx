import { useEffect, useState } from 'react'
import Api from '../services/Api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    Api.get('/orders')
      .then(r=>{ setOrders(r.data); setLoading(false); })
      .catch(e=>{ console.error(e); setLoading(false); })
  },[])

  if (loading) return <div className="pt-32 text-center text-white bg-zinc-950 min-h-screen">Loading orders...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 pt-28 min-h-screen pb-12 text-white">
      <h2 className="text-3xl font-light tracking-[0.25em] mb-10 text-center">ORDER HISTORY</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-2xl bg-zinc-900/10">
          <p className="text-zinc-500">You have not placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(o=> (
            <div key={o._id} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/10 hover:border-zinc-700 transition">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">Order ID</div>
                  <div className="font-semibold text-zinc-200 text-sm">{o._id}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest sm:text-right">Total Amount</div>
                  <div className="text-lg font-bold text-white sm:text-right">₹{o.amount.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                    ${o.status === 'completed' || o.isPaid
                      ? 'bg-green-500/10 text-green-400 border border-green-500/25'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                    }`}>
                    {o.isPaid ? 'Paid' : o.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 tracking-wider">
                  Placed on: {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
