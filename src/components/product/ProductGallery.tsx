"use client";

import { useState } from "react";
import { Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isFlashDeal: boolean;
}

const THUMB_VISIBLE = 6;
const THUMB_SIZE = 82;   // px — width & height of each thumbnail
const THUMB_GAP = 8;     // px gap between thumbs

export default function ProductGallery({ images, productName, isFlashDeal }: ProductGalleryProps) {
  const allImages = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0); // index of first visible thumb

  const totalThumbs = allImages.length;
  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + THUMB_VISIBLE < totalThumbs;

  const visibleThumbs = allImages.slice(thumbOffset, thumbOffset + THUMB_VISIBLE);

  function scrollUp() {
    setThumbOffset((o) => Math.max(0, o - 1));
  }
  function scrollDown() {
    setThumbOffset((o) => Math.min(totalThumbs - THUMB_VISIBLE, o + 1));
  }

  function prevMain() {
    const newIdx = (activeIndex - 1 + totalThumbs) % totalThumbs;
    setActiveIndex(newIdx);
    // Keep active thumb visible
    if (newIdx < thumbOffset) setThumbOffset(newIdx);
    if (newIdx >= thumbOffset + THUMB_VISIBLE) setThumbOffset(newIdx - THUMB_VISIBLE + 1);
  }
  function nextMain() {
    const newIdx = (activeIndex + 1) % totalThumbs;
    setActiveIndex(newIdx);
    if (newIdx < thumbOffset) setThumbOffset(newIdx);
    if (newIdx >= thumbOffset + THUMB_VISIBLE) setThumbOffset(newIdx - THUMB_VISIBLE + 1);
  }

  const activeImage = allImages[activeIndex] ?? null;

  // Total height of thumb strip = 6 thumbs + 5 gaps
  const stripHeight = THUMB_VISIBLE * THUMB_SIZE + (THUMB_VISIBLE - 1) * THUMB_GAP;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Main image + vertical thumbs (desktop) ── */}
      <div className="flex gap-3 items-start">

        {/* Vertical thumbnail strip — hidden on mobile, visible on lg+ */}
        {allImages.length > 1 && (
          <div className="hidden lg:flex flex-col items-center shrink-0" style={{ width: THUMB_SIZE }}>
            <button
              onClick={scrollUp}
              disabled={!canScrollUp}
              className={`w-full flex items-center justify-center py-1 mb-1 rounded transition-colors ${
                canScrollUp
                  ? "text-neutral-500 hover:text-[#FF6A00] hover:bg-orange-50"
                  : "text-neutral-200 cursor-default"
              }`}
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <div
              className="flex flex-col overflow-hidden"
              style={{ gap: THUMB_GAP, height: stripHeight }}
            >
              {visibleThumbs.map((src, i) => {
                const realIdx = i + thumbOffset;
                return (
                  <button
                    key={realIdx}
                    onClick={() => setActiveIndex(realIdx)}
                    style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                    className={`rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                      realIdx === activeIndex
                        ? "border-[#FF6A00]"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${productName} ${realIdx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>

            <button
              onClick={scrollDown}
              disabled={!canScrollDown}
              className={`w-full flex items-center justify-center py-1 mt-1 rounded transition-colors ${
                canScrollDown
                  ? "text-neutral-500 hover:text-[#FF6A00] hover:bg-orange-50"
                  : "text-neutral-200 cursor-default"
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── Main image ── */}
        <div className="relative bg-neutral-50 rounded-xl overflow-hidden flex-1 lg:flex-none"
          style={{ height: 340, minHeight: 260 }}
        >
          <div className="w-full h-full" style={{ minHeight: 260 }}>
            {activeImage ? (
              <img
                src={activeImage}
                alt={productName}
                className="w-full h-full object-contain p-2"
                style={{ minHeight: 260 }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-300">
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
                  onClick={prevMain}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-700" />
                </button>
                <button
                  onClick={nextMain}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-700" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Horizontal thumbnail strip — shown on mobile only ── */}
      {allImages.length > 1 && (
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                i === activeIndex
                  ? "border-[#FF6A00]"
                  : "border-neutral-200"
              }`}
              style={{ width: 64, height: 64 }}
            >
              <img
                src={src}
                alt={`${productName} ${i + 1}`}
                className="w-full h-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
