import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../services/Api';
import { AuthContext } from '../context/Authcontext';

export default function ProductDetail(){
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(()=>{
    Api.get(`/products/${id}`).then(r=>setProduct(r.data.product)).catch(()=>{});
    Api.get(`/products/${id}/reviews`).then(r=>setReviews(r.data.reviews||[])).catch(()=>{});
  },[id]);

  const addToCart = async () => {
    try {
      await Api.post('/cart/add', { productId: id, quantity: 1 })
      alert('Added to cart successfully')
    } catch (err) {
      console.error('add to cart', err)
      if (!user) alert('Please login to add to cart')
      else alert(err?.response?.data?.error || 'Failed to add')
    }
  }

  const submitReview = async ()=>{
    if (!user) return alert('Please login to write a review');
    try{
      const body = { rating, comment };
      const res = await Api.post(`/products/${id}/reviews`, body);
      setReviews(prev=>[res.data.review, ...prev]);
      setComment(''); setRating(5);
    }catch(err){ alert(err?.response?.data?.message || 'Failed to add review') }
  }

  if(!product) return <div className="pt-32 text-center text-white bg-zinc-950 min-h-screen">Loading details...</div>

  const images = product.images || (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div className="max-w-6xl mx-auto p-6 pt-28 min-h-screen pb-12 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Col: Images */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-96 md:h-[500px] flex items-center justify-center overflow-hidden">
            {images[0] ? <img src={images[0]} className="h-full w-full object-cover hover:scale-105 transition duration-500"/> : <div className="text-zinc-600">No image</div>}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((src, i)=> (
              <img key={i} src={src} className="w-24 h-24 object-cover rounded-lg border border-zinc-800 hover:border-white transition cursor-pointer" />
            ))}
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-light tracking-wide">{product.name}</h1>
            <div className="text-2xl font-semibold text-white mt-3">₹{product.price ? product.price.toLocaleString() : '0'}</div>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed border-t border-b border-zinc-800 py-6">{product.description}</p>
          
          <div className="pt-2">
            <button onClick={addToCart} className="w-full py-4 bg-white text-black font-semibold tracking-widest hover:bg-zinc-200 transition text-sm rounded-lg cursor-pointer">
              ADD TO CART
            </button>
          </div>

          <div className="pt-4 space-y-3">
            <h3 className="font-semibold text-sm tracking-wider text-zinc-300 uppercase">Specifications</h3>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li className="flex justify-between border-b border-zinc-900 pb-2">
                <span>Category</span>
                <span className="text-white capitalize">{product.category}</span>
              </li>
              <li className="flex justify-between border-b border-zinc-900 pb-2">
                <span>Availability</span>
                <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                  {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </span>
              </li>
              <li className="flex justify-between border-b border-zinc-900 pb-2">
                <span>SKU ID</span>
                <span className="text-zinc-500 text-xs">{product._id}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h3 className="text-2xl font-light tracking-wide mb-8">REVIEWS & RATINGS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-zinc-500 italic">No reviews yet for this product.</p>
            ) : (
              reviews.map(r=> (
                <div key={r._id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-zinc-200">{r.name}</div>
                    <div className="text-sm text-amber-400">{"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}</div>
                  </div>
                  <div className="text-sm text-zinc-400">{r.comment}</div>
                </div>
              ))
            )}
          </div>

          {/* Add Review */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 h-fit space-y-4">
            <h4 className="font-semibold text-zinc-200 tracking-wider">SHARE YOUR THOUGHTS</h4>
            <div>
              <label className="text-xs text-zinc-400 tracking-widest block mb-2">RATING</label>
              <select value={rating} onChange={e=>setRating(Number(e.target.value))} className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white">
                {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 tracking-widest block mb-2">COMMENT</label>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={4} className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-white" placeholder="Write a review..." />
            </div>
            <button onClick={submitReview} className="px-6 py-3 bg-white text-black font-semibold text-xs tracking-widest hover:bg-zinc-200 transition rounded-lg cursor-pointer">
              SUBMIT REVIEW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
