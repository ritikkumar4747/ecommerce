import { useState } from 'react';
import { Link } from 'react-router-dom';
import QuickView from './QuickView';

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden group hover:border-white/20 transition duration-300 flex flex-col justify-between">
      <div className="h-64 bg-zinc-900 flex items-center justify-center overflow-hidden relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="object-cover h-full w-full group-hover:scale-105 transition duration-500" 
        />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] tracking-widest text-zinc-300 px-2.5 py-1 uppercase rounded-md border border-zinc-800/50">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-light text-lg tracking-wide text-white line-clamp-1">{product.name}</h3>
          <div className="mt-2 text-xl font-semibold text-zinc-300">₹{product.price ? product.price.toLocaleString() : '0'}</div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <button 
            onClick={() => setOpen(true)} 
            className="flex-1 py-2 border border-zinc-800 hover:border-white text-zinc-300 hover:text-white transition text-xs tracking-widest uppercase rounded-lg cursor-pointer"
          >
            Quick View
          </button>
          <Link 
            to={`/products/${product._id}`} 
            className="flex-1 py-2 bg-white text-black hover:bg-zinc-200 text-center transition text-xs tracking-widest uppercase rounded-lg font-semibold"
          >
            Details
          </Link>
        </div>
        <QuickView product={product} open={open} onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
