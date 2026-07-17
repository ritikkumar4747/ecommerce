import { useEffect, useState } from 'react'
import Api from '../services/Api'
import { useNavigate, Link } from 'react-router-dom'

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
    document.body.appendChild(script)
  })
}

export default function Cart() {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ recipientName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '', label: '', isDefault: false })
  const [saveAddress, setSaveAddress] = useState(false)
  const [addressErrors, setAddressErrors] = useState({})
  const navigate = useNavigate()

  const fetchCart = async () => {
    try {
      const res = await Api.get('/cart')
      setCart(res.data || { items: [] })
      // fetch saved addresses
      try{ const aRes = await Api.get('/addresses'); setAddresses(aRes.data || []); if(aRes.data && aRes.data.length>0) setSelectedAddressId(aRes.data.find(x=>x.isDefault)?._id || aRes.data[0]._id); }catch(e){}
    } catch (err) {
      console.error('fetch cart', err)
      setError(err?.response?.data?.error || 'Unable to fetch cart')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQty = async (productId, qty) => {
    if (qty < 1) return;
    try {
      await Api.put('/cart/update', { productId, quantity: qty })
      fetchCart()
    } catch (err) { console.error(err); alert('Update failed') }
  }

  const removeItem = async (productId) => {
    try {
      await Api.delete('/cart/remove', { data: { productId } })
      fetchCart()
    } catch (err) { console.error(err); alert('Remove failed') }
  }

  const checkout = async () => {
    try {
      // validate address selection
      let body = {};
      if(useNewAddress){
        const required = ["recipientName","line1","city","postalCode","country","phone"];
        const errs = {};
        required.forEach(f=>{ if(!newAddress[f] || String(newAddress[f]).trim()==='') errs[f] = 'Required' });
        if(Object.keys(errs).length>0){ setAddressErrors(errs); return }
        body.shippingAddress = newAddress;
        if(saveAddress) body.saveAddress = true;
      } else {
        if(!selectedAddressId) { setAddressErrors({ global: 'Please select a shipping address' }); return }
        body.addressId = selectedAddressId;
      }

      const res = await Api.post('/orders/checkout', body)
      const { razorpayOrder, razorpayKey, order } = res.data
      await loadRazorpay()

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Luxury Eshop',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const verify = await Api.post('/orders/verify', response)
            alert('Payment successful')
            navigate('/orders')
          } catch (err) {
            console.error('verify', err)
            alert('Payment verification failed')
          }
        },
        prefill: {
          email: '',
        },
        theme: { color: '#09090b' }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error('checkout', err)
      alert(err?.response?.data?.error || 'Checkout failed')
    }
  }

  if (loading) return <div className="pt-32 text-center text-white bg-zinc-950 min-h-screen">Loading cart...</div>
  if (error) return <div className="pt-32 text-center text-red-400 bg-zinc-950 min-h-screen">{error}</div>

  // Filter out any items where product details couldn't be resolved (null productId due to deletion)
  const validItems = cart.items.filter(it => it.productId);
  const total = validItems.reduce((s, it) => s + (it.productId?.price || 0) * it.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto p-6 pt-28 min-h-screen pb-12 text-white">
      <h2 className="text-3xl font-light tracking-[0.25em] mb-8 text-center">YOUR SHOPPING BAG</h2>
      
      {validItems.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-2xl bg-zinc-900/10">
          <p className="text-zinc-500 mb-6">Your shopping bag is empty.</p>
          <Link to="/products" className="px-6 py-3 bg-white text-black font-semibold text-xs tracking-widest hover:bg-zinc-200 transition rounded-lg">
            BROWSE PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {validItems.map((it) => (
              <div key={it.productId._id} className="flex items-center justify-between p-5 border border-zinc-800 rounded-xl bg-zinc-900/20">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
                    <img src={it.productId.imageUrl} alt={it.productId.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-sm hover:text-white transition">
                      <Link to={`/products/${it.productId._id}`}>{it.productId.name}</Link>
                    </h3>
                    <div className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">{it.productId.category}</div>
                    <div className="text-sm font-semibold text-zinc-300 mt-1">₹{it.productId.price ? it.productId.price.toLocaleString() : '0'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
                    <button onClick={() => updateQty(it.productId._id, it.quantity - 1)} className="px-3 py-1 text-zinc-400 hover:text-white transition cursor-pointer">-</button>
                    <span className="px-2 text-zinc-100 text-sm w-8 text-center">{it.quantity}</span>
                    <button onClick={() => updateQty(it.productId._id, it.quantity + 1)} className="px-3 py-1 text-zinc-400 hover:text-white transition cursor-pointer">+</button>
                  </div>
                  <button onClick={() => removeItem(it.productId._id)} className="text-xs tracking-wider text-red-400 hover:text-red-300 transition uppercase cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 h-fit space-y-6">
            <div>
              <h4 className="text-sm text-zinc-300 mb-3">Shipping Address</h4>
              {addresses.length>0 && (
                <select aria-label="Saved shipping address" value={selectedAddressId||''} onChange={e=>{ setSelectedAddressId(e.target.value); setUseNewAddress(false); setAddressErrors({}); }} className="w-full p-2 bg-zinc-800 text-white rounded mb-3">
                  <option value="">-- Select saved address --</option>
                  {addresses.map(a=> <option key={a._id} value={a._id}>{(a.label? a.label + ' - ' : '') + a.recipientName + ', ' + a.line1 + (a.city?(', '+a.city):'')}</option>)}
                </select>
              )}
              {addressErrors.global && <div role="alert" className="text-rose-400 text-sm mb-2">{addressErrors.global}</div>}
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" checked={useNewAddress} onChange={e=>setUseNewAddress(e.target.checked)} /> <span className="text-sm text-zinc-400">Enter a new shipping address</span>
              </div>

              {useNewAddress && (
                <div className="space-y-2 mb-3">
                  <input aria-required="true" aria-invalid={!!addressErrors.recipientName} value={newAddress.recipientName} onChange={e=>{ setNewAddress({...newAddress, recipientName:e.target.value}); setAddressErrors(prev=>({ ...prev, recipientName: '' })); }} placeholder="Recipient name" className="w-full p-2 bg-zinc-900/30 rounded" />
                  {addressErrors.recipientName && <div role="alert" className="text-rose-400 text-sm">{addressErrors.recipientName}</div>}

                  <input aria-required="true" aria-invalid={!!addressErrors.line1} value={newAddress.line1} onChange={e=>{ setNewAddress({...newAddress, line1:e.target.value}); setAddressErrors(prev=>({ ...prev, line1: '' })); }} placeholder="Address line 1" className="w-full p-2 bg-zinc-900/30 rounded" />
                  {addressErrors.line1 && <div role="alert" className="text-rose-400 text-sm">{addressErrors.line1}</div>}

                  <input value={newAddress.line2} onChange={e=>setNewAddress({...newAddress, line2:e.target.value})} placeholder="Address line 2" className="w-full p-2 bg-zinc-900/30 rounded" />

                  <div className="grid grid-cols-3 gap-2">
                    <input aria-required="true" aria-invalid={!!addressErrors.city} value={newAddress.city} onChange={e=>{ setNewAddress({...newAddress, city:e.target.value}); setAddressErrors(prev=>({ ...prev, city: '' })); }} placeholder="City" className="p-2 bg-zinc-900/30 rounded" />
                    {addressErrors.city && <div role="alert" className="text-rose-400 text-sm col-span-3">{addressErrors.city}</div>}

                    <input aria-required="true" aria-invalid={!!addressErrors.postalCode} value={newAddress.postalCode} onChange={e=>{ setNewAddress({...newAddress, postalCode:e.target.value}); setAddressErrors(prev=>({ ...prev, postalCode: '' })); }} placeholder="Postal code" className="p-2 bg-zinc-900/30 rounded" />
                    {addressErrors.postalCode && <div role="alert" className="text-rose-400 text-sm col-span-3">{addressErrors.postalCode}</div>}

                    <input aria-required="true" aria-invalid={!!addressErrors.country} value={newAddress.country} onChange={e=>{ setNewAddress({...newAddress, country:e.target.value}); setAddressErrors(prev=>({ ...prev, country: '' })); }} placeholder="Country" className="p-2 bg-zinc-900/30 rounded" />
                    {addressErrors.country && <div role="alert" className="text-rose-400 text-sm col-span-3">{addressErrors.country}</div>}
                  </div>

                  <input aria-required="true" aria-invalid={!!addressErrors.phone} value={newAddress.phone} onChange={e=>{ setNewAddress({...newAddress, phone:e.target.value}); setAddressErrors(prev=>({ ...prev, phone: '' })); }} placeholder="Phone number" className="w-full p-2 bg-zinc-900/30 rounded" />
                  {addressErrors.phone && <div role="alert" className="text-rose-400 text-sm">{addressErrors.phone}</div>}

                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={saveAddress} onChange={e=>setSaveAddress(e.target.checked)} /> <span className="text-sm text-zinc-400">Save this address to profile</span>
                  </div>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-zinc-200 tracking-wider uppercase text-sm border-b border-zinc-800 pb-3">ORDER SUMMARY</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-semibold">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Shipping</span>
                <span className="text-green-400 font-semibold uppercase text-xs">Free</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-zinc-800 pt-3 text-white">
                <span>Total</span>
                <span className="text-lg text-white">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={checkout} className="w-full py-3 bg-white text-black font-semibold text-xs tracking-widest hover:bg-zinc-200 transition rounded-lg cursor-pointer">
              PROCEED TO CHECKOUT
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
