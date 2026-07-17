import { useEffect, useState } from 'react'
import Api from '../services/Api'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Api.get('/products')
      .then(res => { if (mounted) setProducts(res.data.products || []) })
      .catch(err => console.error('products fetch', err))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="pt-32 text-center text-white bg-zinc-950 min-h-screen">Loading products...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 pt-28 min-h-screen pb-12">
      <h2 className="text-3xl font-light tracking-[0.25em] mb-10 text-center text-white">COLLECTIONS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  )
}
