import React from 'react';

export default function Logo({ className = "h-8" }) {
  return (
    <svg className={`${className} text-white fill-current overflow-visible`} viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg">
      {/* Calligraphic Curvy L */}
      <path d="M 32 10 C 32 6 38 6 41 6 C 45 6 45 10 45 14 C 45 26 44 32 41 36 C 37 42 23 45 23 49 C 23 52 31 53 44 53 C 64 53 79 49 91 41 C 94 39 91 36 87 38 C 74 44 60 47 48 47 C 42 47 38 46 38 43 C 38 41 40 38 42 32 C 45 24 47 16 47 10" />
      {/* UXURY text next to it with curvy ligature underline */}
      <text x="65" y="42" fontFamily="'Outfit', sans-serif" fontWeight="200" fontSize="30" letterSpacing="0.4em">UXURY</text>
    </svg>
  );
}
