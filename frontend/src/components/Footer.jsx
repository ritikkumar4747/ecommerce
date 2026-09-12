export default function Footer(){
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-white/5 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <h4 className="text-white font-light tracking-widest uppercase text-sm">Luxury</h4>
          <p className="text-sm leading-relaxed">Curated marketplace for premium cars, watches, designer collections, and exclusive properties.</p>
        </div>
        <div className="space-y-4">
          <h5 className="text-white font-light tracking-widest uppercase text-sm">Shop</h5>
          <ul className="text-sm space-y-2">
            <li className="hover:text-white transition cursor-pointer">Cars</li>
            <li className="hover:text-white transition cursor-pointer">Watches</li>
            <li className="hover:text-white transition cursor-pointer">Bags</li>
            <li className="hover:text-white transition cursor-pointer">Homes</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-white font-light tracking-widest uppercase text-sm">Support</h5>
          <ul className="text-sm space-y-2">
            <li className="hover:text-white transition cursor-pointer">Help Center</li>
            <li className="hover:text-white transition cursor-pointer">Returns</li>
            <li className="hover:text-white transition cursor-pointer">Contact Us</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-white font-light tracking-widest uppercase text-sm">Stay updated</h5>
          <p className="text-sm leading-relaxed">Subscribe to receive notifications about new collections and exclusive arrivals.</p>
          <div className="flex shadow-sm">
            <input className="p-3 bg-zinc-900 border border-zinc-800 text-white rounded-l-lg focus:outline-none focus:border-white text-sm flex-1" placeholder="Your email" />
            <button className="bg-white text-black hover:bg-zinc-200 px-5 rounded-r-lg font-semibold tracking-widest text-xs transition uppercase cursor-pointer">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-900 text-xs text-zinc-600 py-6 text-center tracking-widest">© {new Date().getFullYear()} LUXURY MARKETPLACE. ALL RIGHTS RESERVED.</div>
    </footer>
  )
}
