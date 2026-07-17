import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Api from "../services/Api";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

export default function LuxuryHero() {
  const [active, setActive] = useState("cars");

  const videos = {
    cars: "/181536-866999858_medium.mp4",
    watches: "/12629244_1080_1920_30fps.mp4",
    bags: "/6266292-uhd_3840_2160_25fps.mp4",
    homes: "/12062275_1080_1920_60fps.mp4",
  };

  const titles = {
    cars: "ULTIMATE LUXURY CARS",
    watches: "PREMIUM TIMEPIECES",
    bags: "DESIGNER COLLECTIONS",
    homes: "EXCLUSIVE PROPERTIES",
  };

  const subtitles = {
    cars: "Experience power, elegance & performance",
    watches: "Crafted precision beyond time",
    bags: "Iconic fashion, timeless style",
    homes: "Architectural masterpieces worldwide",
  };

  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    Api.get('/products').then(res => {
      if (!mounted) return;
      setProducts(res.data.products || []);
    }).catch((err) => { console.error('Failed to fetch products:', err); });
    return () => { mounted = false };
  }, []);


  return (
    <div className="w-full bg-zinc-950 text-white min-h-screen">

      {/* Hero Section Container */}
      <div className="relative w-full h-screen overflow-hidden">
        
        {/* Video Background */}
        <video
          key={active}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={videos[active]} type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          
          {/* Brand Logo */}
          <div className="mb-8 scale-125 md:scale-150 flex justify-center">
            <Logo className="h-16 md:h-20 w-auto" />
          </div>

          {/* Dynamic Title */}
          <h2 className="text-xl md:text-3xl font-light tracking-widest mb-3">
            {titles[active]}
          </h2>

          <p className="text-gray-300 max-w-xl mb-10 text-sm tracking-wide">
            {subtitles[active]}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 mb-10">
            <Link to="/products" className="px-6 py-3 border border-white hover:bg-white hover:text-black transition tracking-widest text-sm flex items-center">
              EXPLORE
            </Link>
            <button onClick={() => document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" })} className="px-6 py-3 bg-white text-black hover:opacity-80 transition tracking-widest text-sm cursor-pointer">
              VIEW COLLECTION
            </button>
          </div>

          {/* Category Switch */}
          <div className="flex gap-3 flex-wrap justify-center">
            {Object.keys(videos).map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`px-4 py-2 border text-xs tracking-widest transition cursor-pointer
                  ${active === key
                    ? "bg-white text-black border-white"
                    : "border-white/40 text-white hover:border-white"
                  }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
          
        </div>
      </div>

      {/* Featured Products */}
      <section id="featured-section" className="bg-zinc-950 text-white py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-light tracking-[0.2em] mb-12 text-center">FEATURED {active.toUpperCase()}</h2>
          {products.filter(p => p.category === active).length === 0 ? (
            <p className="text-center text-gray-500 py-10">No items available in this collection.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products.filter(p => p.category === active).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
