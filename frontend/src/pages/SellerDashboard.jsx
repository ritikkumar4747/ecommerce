import { useState, useEffect } from 'react'
import Api from '../services/Api'

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  
  // Products State
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('watches')
  const [stock, setStock] = useState('10')
  const [images, setImages] = useState([])
  const [formMessage, setFormMessage] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Orders State
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersMessage, setOrdersMessage] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await Api.get('/products/seller/me')
      setProducts(res.data.products || [])
    } catch (err) {
      console.error(err)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await Api.get('/orders/seller/me')
      setOrders(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter(f => f.type.startsWith('image/')).slice(0, 5)
    setImages(valid)
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    setFormMessage(null)

    if (!name.trim()) return setFormMessage('Name is required')
    if (!description.trim()) return setFormMessage('Description is required')
    if (!price || Number(price) <= 0) return setFormMessage('Price must be greater than 0')
    if (!stock || Number(stock) < 0) return setFormMessage('Stock must be 0 or more')
    if (images.length === 0) return setFormMessage('Please select at least one image')

    setFormSubmitting(true)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    fd.append('price', price)
    fd.append('category', category)
    fd.append('stock', stock)
    images.forEach(img => fd.append('images', img))

    try {
      await Api.post('/products', fd)
      setFormMessage({ type: 'success', text: 'Product created successfully' })
      setName('')
      setDescription('')
      setPrice('')
      setCategory('watches')
      setStock('10')
      setImages([])
      setShowCreateForm(false)
      fetchProducts()
    } catch (err) {
      console.error(err)
      setFormMessage({ type: 'error', text: err?.response?.data?.message || err?.response?.data?.error || 'Failed to create product' })
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description)
    setPrice(product.price)
    setCategory(product.category)
    setStock(product.stock)
    setFormMessage(null)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setFormMessage(null)

    if (!name.trim()) return setFormMessage('Name is required')
    if (!description.trim()) return setFormMessage('Description is required')
    if (!price || Number(price) <= 0) return setFormMessage('Price must be greater than 0')
    if (!stock || Number(stock) < 0) return setFormMessage('Stock must be 0 or more')

    setFormSubmitting(true)
    try {
      const payload = { name, description, price: Number(price), category, stock: Number(stock) }
      await Api.put(`/products/${editingProduct._id}`, payload)
      setFormMessage({ type: 'success', text: 'Product updated successfully' })
      setEditingProduct(null)
      setName('')
      setDescription('')
      setPrice('')
      setStock('10')
      fetchProducts()
    } catch (err) {
      console.error(err)
      setFormMessage({ type: 'error', text: err?.response?.data?.message || err?.response?.data?.error || 'Failed to update product' })
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await Api.delete(`/products/${productId}`)
      fetchProducts()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrdersMessage(null)
    try {
      await Api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrdersMessage({ type: 'success', text: 'Order status updated successfully' })
      fetchOrders()
    } catch (err) {
      console.error(err)
      setOrdersMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to update order status' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light tracking-[0.2em] mb-12 text-center">SELLER PORTAL</h1>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-8 border-b border-zinc-800 pb-4 mb-8">
          <button 
            onClick={() => setActiveTab('products')}
            className={`text-sm tracking-widest uppercase transition ${activeTab === 'products' ? 'text-white border-b-2 border-white pb-4 -mb-[18px] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            My Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`text-sm tracking-widest uppercase transition ${activeTab === 'orders' ? 'text-white border-b-2 border-white pb-4 -mb-[18px] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            My Orders
          </button>
        </div>

        {/* Tab Contents: Products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-light tracking-wide text-zinc-400">Inventory Items</h2>
              {!showCreateForm && !editingProduct && (
                <button 
                  onClick={() => { setShowCreateForm(true); setFormMessage(null); }}
                  className="px-6 py-2 bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition"
                >
                  Create Product
                </button>
              )}
            </div>

            {/* Forms */}
            {(showCreateForm || editingProduct) && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-light tracking-wide uppercase text-zinc-300">
                    {editingProduct ? `Edit ${editingProduct.name}` : 'Create New Product'}
                  </h3>
                  <button 
                    onClick={() => { setShowCreateForm(false); setEditingProduct(null); setFormMessage(null); }}
                    className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-zinc-400 tracking-wider block mb-2">PRODUCT NAME</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g. Classic Tourbillon" 
                        className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 tracking-wider block mb-2">CATEGORY</label>
                      <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white capitalize"
                      >
                        <option value="cars">Cars</option>
                        <option value="watches">Watches</option>
                        <option value="bags">Bags</option>
                        <option value="homes">Homes</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 tracking-wider block mb-2">DESCRIPTION</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={4} 
                      placeholder="Detailed product descriptions..." 
                      className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-zinc-400 tracking-wider block mb-2">PRICE (INR)</label>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        placeholder="Price" 
                        className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 tracking-wider block mb-2">STOCK</label>
                      <input 
                        type="number" 
                        value={stock} 
                        onChange={e => setStock(e.target.value)} 
                        placeholder="Stock" 
                        className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {!editingProduct && (
                    <div>
                      <label className="text-xs text-zinc-400 tracking-wider block mb-2">PRODUCT IMAGES (MAX 5)</label>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleFiles} 
                        className="w-full p-3 bg-zinc-950/50 border border-zinc-800 text-zinc-400 rounded-lg focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                      />
                    </div>
                  )}

                  <button 
                    disabled={formSubmitting} 
                    type="submit" 
                    className="w-full py-4 bg-white text-black font-semibold tracking-widest hover:bg-zinc-200 transition text-xs uppercase rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    {formSubmitting ? 'PROCESSING...' : (editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT')}
                  </button>
                </form>

                {formMessage && (
                  <div className={`mt-6 text-center text-sm p-3 rounded-lg border 
                    ${formMessage.type === 'success' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {formMessage.text}
                  </div>
                )}
              </div>
            )}

            {/* Inventory List */}
            {productsLoading ? (
              <div className="text-center py-20 text-zinc-500">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-zinc-900 rounded-xl bg-zinc-950/10">
                <p className="text-zinc-500">No products uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p._id} className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden flex flex-col hover:border-zinc-700 transition">
                    <div className="aspect-video w-full bg-zinc-950">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-zinc-200 tracking-wide line-clamp-1">{p.name}</h3>
                          <span className="text-xs uppercase tracking-widest text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">{p.category}</span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{p.description}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-sm border-t border-zinc-800 pt-4 mb-4">
                          <div>
                            <span className="text-xs text-zinc-500 block">PRICE</span>
                            <span className="font-bold text-white">₹{p.price.toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-zinc-500 block">STOCK</span>
                            <span className={`font-semibold ${p.stock > 0 ? 'text-zinc-300' : 'text-red-400'}`}>
                              {p.stock > 0 ? `${p.stock} units` : 'Out of stock'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleEditProduct(p)}
                            className="py-2 border border-zinc-800 hover:border-white text-xs tracking-wider uppercase transition text-center"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p._id)}
                            className="py-2 border border-red-900/40 hover:border-red-600 text-red-400 text-xs tracking-wider uppercase transition text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Contents: Orders */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-light tracking-wide text-zinc-400 mb-8">Customer Placed Orders</h2>

            {ordersMessage && (
              <div className={`mb-6 text-center text-sm p-3 rounded-lg border 
                ${ordersMessage.type === 'success' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                {ordersMessage.text}
              </div>
            )}

            {ordersLoading ? (
              <div className="text-center py-20 text-zinc-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 border border-zinc-900 rounded-xl bg-zinc-950/10">
                <p className="text-zinc-500">No orders placed for your products yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(o => (
                  <div key={o._id} className="border border-zinc-800 rounded-xl bg-zinc-900/10 p-6 md:p-8 hover:border-zinc-700 transition space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <span className="text-xs text-zinc-500 tracking-wider block">ORDER ID</span>
                        <span className="font-semibold text-zinc-200">{o._id}</span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 tracking-wider block">ORDER DATE</span>
                        <span className="text-sm">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 tracking-wider">STATUS:</span>
                        <select 
                          value={o.status} 
                          onChange={e => handleUpdateOrderStatus(o._id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1 rounded focus:outline-none focus:border-white capitalize"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Buyer & Address details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="text-xs tracking-wider text-zinc-500 uppercase mb-2">Customer Details</h4>
                        <p className="text-zinc-200">{o.userId?.name || 'Guest'}</p>
                        <p className="text-zinc-400">{o.userId?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs tracking-wider text-zinc-500 uppercase mb-2">Shipping Address</h4>
                        {o.shippingAddress ? (
                          <p className="text-zinc-400 leading-relaxed">
                            {o.shippingAddress.recipientName}<br />
                            {o.shippingAddress.line1} {o.shippingAddress.line2 || ''}<br />
                            {o.shippingAddress.city}, {o.shippingAddress.state || ''} {o.shippingAddress.postalCode}<br />
                            {o.shippingAddress.country}<br />
                            Phone: {o.shippingAddress.phone || 'N/A'}
                          </p>
                        ) : (
                          <p className="text-zinc-500">No shipping address provided</p>
                        )}
                      </div>
                    </div>

                    {/* Items belonging to this seller */}
                    <div>
                      <h4 className="text-xs tracking-wider text-zinc-500 uppercase mb-3">Purchased Items</h4>
                      <div className="border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950/20 divide-y divide-zinc-800/60">
                        {o.items.map(item => (
                          <div key={item._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                                <img src={item.productId?.imageUrl} alt={item.productId?.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-200">{item.productId?.name || 'Deleted Product'}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest">{item.productId?.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 text-sm">
                              <div>
                                <span className="text-xs text-zinc-500 block">QTY</span>
                                <span className="text-zinc-300 font-semibold">{item.quantity}</span>
                              </div>
                              <div>
                                <span className="text-xs text-zinc-500 block">PRICE</span>
                                <span className="text-zinc-300 font-semibold">₹{item.priceAtPurchase?.toLocaleString() || item.productId?.price?.toLocaleString() || 0}</span>
                              </div>
                              <div className="text-right min-w-[80px]">
                                <span className="text-xs text-zinc-500 block">SUBTOTAL</span>
                                <span className="font-bold text-white">₹{((item.priceAtPurchase || item.productId?.price || 0) * item.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
