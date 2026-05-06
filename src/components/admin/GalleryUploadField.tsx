"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, Star, GripVertical } from "lucide-react";
import { uploadProductImage } from "@/app/admin/actions";

interface GalleryUploadFieldProps {
  defaultImages?: string[];
}

export default function GalleryUploadField({ defaultImages = [] }: GalleryUploadFieldProps) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  async function handleFiles(files: FileList) {
    setUploadError(null);
    const toUpload = Array.from(files).slice(0, 10 - images.length);
    if (toUpload.length === 0) {
      setUploadError("Maximum 10 images allowed.");
      return;
    }
    setUploading(true);
    const results = await Promise.all(
      toUpload.map((file) => {
        const fd = new FormData();
        fd.append("file", file);
        return uploadProductImage(fd);
      })
    );
    setUploading(false);
    const urls: string[] = [];
    const errors: string[] = [];
    for (const r of results) {
      if ("error" in r) errors.push(r.error);
      else urls.push(r.url);
    }
    if (errors.length) setUploadError(errors.join(", "));
    setImages((prev) => [...prev, ...urls]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function setMain(idx: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  }

  function onDragStart(idx: number) { dragIndex.current = idx; }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === idx) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIndex.current!, 1);
      next.splice(idx, 0, item);
      dragIndex.current = idx;
      return next;
    });
  }
  function onDragEnd() { dragIndex.current = null; }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-700">
          Product Images
          <span className="ml-2 text-xs font-normal text-neutral-400">First image is the main photo · max 10</span>
        </label>
        {images.length > 0 && (
          <span className="text-xs text-neutral-400">{images.length}/10</span>
        )}
      </div>

      {/* Drop zone */}
      {images.length < 10 && (
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-[#FF6A00] hover:bg-orange-50/30 transition-colors"
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-[#FF6A00]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Uploading…</span>
            </div>
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-neutral-400" />
              <p className="text-xs text-neutral-500 text-center">
                Click or drag & drop to upload<br />
                <span className="text-neutral-400">JPG, PNG, WebP · max 5 MB each · bulk supported</span>
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, idx) => (
            <div
              key={src + idx}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              className="relative group cursor-grab active:cursor-grabbing"
            >
              <div className={`relative w-full aspect-square rounded-lg border-2 overflow-hidden bg-neutral-50 transition-colors ${
                idx === 0 ? "border-[#FF6A00]" : "border-neutral-200 hover:border-neutral-400"
              }`}>
                <img src={src} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />

                {/* Main badge */}
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#FF6A00]/90 text-white text-[10px] font-bold text-center py-0.5">
                    MAIN
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setMain(idx)}
                      title="Set as main"
                      className="w-7 h-7 bg-[#FF6A00] hover:bg-[#e05e00] rounded-full flex items-center justify-center text-white"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    title="Remove"
                    className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity text-white">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden inputs — main image + full gallery */}
      <input type="hidden" name="image_url" value={images[0] ?? ""} />
      <input type="hidden" name="gallery_images" value={JSON.stringify(images)} />
    </div>
  );
}
