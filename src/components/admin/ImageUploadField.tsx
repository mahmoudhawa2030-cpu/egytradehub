"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, X, Loader2 } from "lucide-react";
import { uploadProductImage } from "@/app/admin/actions";

interface ImageUploadFieldProps {
  defaultUrl?: string | null;
}

export default function ImageUploadField({ defaultUrl }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>(defaultUrl ?? "");
  const [urlInput, setUrlInput] = useState<string>(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProductImage(fd);
    setUploading(false);
    if ("error" in result) {
      setUploadError(result.error);
    } else {
      setPreview(result.url);
      setUrlInput(result.url);
    }
  }

  function handleUrlBlur() {
    if (urlInput.startsWith("http")) setPreview(urlInput);
  }

  function clearImage() {
    setPreview("");
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">Product Image</label>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "upload" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <ImagePlus className="w-3.5 h-3.5" />
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "url" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          Paste URL
        </button>
      </div>

      {tab === "upload" ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-[#FF6A00] hover:bg-orange-50/30 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-[#FF6A00] animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-neutral-400" />
              <p className="text-xs text-neutral-500">Click to upload · JPG, PNG, WebP · max 5 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
        />
      )}

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {/* Preview thumbnail strip */}
      {preview && (
        <div className="relative w-fit">
          <div className="flex gap-2 items-end">
            {/* Main preview */}
            <div className="w-28 h-28 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 flex items-center justify-center">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            </div>
            {/* Thumbnail-size preview (simulates gallery thumb) */}
            <div className="w-14 h-14 rounded-md border border-neutral-200 overflow-hidden bg-neutral-50 flex items-center justify-center">
              <img src={preview} alt="thumbnail preview" className="w-full h-full object-cover" />
            </div>
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Hidden input carries the final URL into the form */}
      <input type="hidden" name="image_url" value={urlInput} />
    </div>
  );
}
