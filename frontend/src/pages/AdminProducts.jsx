import { useState } from 'react'
import Api from '../services/Api'

export default function AdminProducts() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('cars')
  const [stock, setStock] = useState('10')
  const [images, setImages] = useState([])
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    // basic validation: only images, max 5 files
    const valid = files.filter(f => f.type.startsWith('image/')).slice(0,5)
    setImages(valid)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    // validations
    if (!name.trim()) return setMessage('Name is required')
    if (!description.trim()) return setMessage('Description is required')
    if (!price || Number(price) <= 0) return setMessage('Price must be greater than 0')
    if (!stock || Number(stock) < 0) return setMessage('Stock must be 0 or more')
    if (images.length === 0) return setMessage('Please select at least one image')

    setSubmitting(true)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    fd.append('price', price)
    fd.append('category', category)
    fd.append('stock', stock)
    images.forEach(img => fd.append('images', img))

    try {
      await Api.post('/products', fd)
      setMessage('Product created successfully')
      setName(''); setDescription(''); setPrice(''); setCategory('cars'); setStock('10'); setImages([])
    } catch (err) {
      console.error(err)
      setMessage(err?.response?.data?.message || err?.response?.data?.error || 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-28 min-h-screen pb-12 text-white">
      <h2 className="text-3xl font-light tracking-[0.25em] mb-10 text-center">CREATE PRODUCT</h2>
      
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs text-zinc-400 tracking-widest block mb-2">PRODUCT NAME</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Aurora Sport GT" className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white" />
          </div>

          <div>
            <label className="text-xs text-zinc-400 tracking-widest block mb-2">DESCRIPTION</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="Product description..." className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs text-zinc-400 tracking-widest block mb-2">PRICE (INR)</label>
              <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" type="number" className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white" />
            </div>

            <div>
              <label className="text-xs text-zinc-400 tracking-widest block mb-2">CATEGORY</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white capitalize">
                <option value="cars">Cars</option>
                <option value="watches">Watches</option>
                <option value="bags">Bags</option>
                <option value="homes">Homes</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 tracking-widest block mb-2">INITIAL STOCK</label>
              <input value={stock} onChange={e=>setStock(e.target.value)} placeholder="Stock" type="number" className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white" />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 tracking-widest block mb-2">PRODUCT IMAGES (MAX 5)</label>
            <input type="file" multiple accept="image/*" onChange={handleFiles} className="w-full p-3 bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 rounded-lg focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer" />
          </div>

          {/* Previews */}
          {images.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 tracking-widest block">IMAGE PREVIEWS</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button disabled={submitting} type="submit" className="w-full py-4 bg-white text-black font-semibold tracking-widest hover:bg-zinc-200 transition text-sm rounded-lg disabled:opacity-50 cursor-pointer">
            {submitting ? 'CREATING PRODUCT...' : 'CREATE PRODUCT'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-6 text-center text-sm p-3 rounded-lg border 
            ${message.includes('success') 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
