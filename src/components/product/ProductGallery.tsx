"use client";

import { useState } from "react";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isFlashDeal: boolean;
}

export default function ProductGallery({ images, productName, isFlashDeal }: ProductGalleryProps) {
  const allImages = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActiveIndex((i) => (i + 1) % allImages.length);

  const activeImage = allImages[activeIndex] ?? null;

  return (
    <div className="flex gap-3 items-start">
      {/* Thumbnail strip – left column, top-aligned */}
      {allImages.length > 1 && (
        <div className="flex flex-col gap-2 w-[80px] shrink-0">
          {allImages.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-[80px] h-[80px] rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                idx === activeIndex
                  ? "border-[#FF6A00]"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <img
                src={src}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center h-[460px]">
        {activeImage ? (
          <img
            src={activeImage}
            alt={productName}
            className="w-full h-full object-contain max-h-[460px]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">No image available</span>
          </div>
        )}

        {isFlashDeal && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FF6A00] text-white text-xs font-semibold shadow">
            <Zap className="w-3 h-3" /> Flash deal
          </div>
        )}

        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-neutral-700" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
