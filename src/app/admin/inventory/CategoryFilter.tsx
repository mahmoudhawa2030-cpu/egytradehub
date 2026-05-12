"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function CategoryFilter({
  categories,
  activeCategory,
  totalCount,
  paramName = "category",
  basePath = "/admin/inventory",
}: {
  categories: string[];
  activeCategory: string | undefined;
  totalCount: number;
  paramName?: string;
  basePath?: string;
}) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const url = val 
      ? `${basePath}?${paramName}=${encodeURIComponent(val)}` 
      : basePath;
    router.push(url);
  }

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative">
        <select
          value={activeCategory ?? ""}
          onChange={handleChange}
          className="appearance-none pl-4 pr-10 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 focus:outline-none focus:border-[#FF6A00] cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      </div>
      <span className="text-sm text-neutral-500">
        <span className="font-semibold text-neutral-900">{totalCount}</span>{" "}
        {totalCount === 1 ? "product" : "products"}
        {activeCategory ? ` in "${activeCategory}"` : ""}
      </span>
    </div>
  );
}
