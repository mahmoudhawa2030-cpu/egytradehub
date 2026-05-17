import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

interface Props {
  params: { slug: string; locale: string };
}

export default async function CategoryPage({ params }: Props) {
  const { slug, locale } = params;
  const supabase = await createClient();

  // Get parent category
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, thumbnail_url, icon")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  // Get subcategories (3x3 = 9 max)
  const { data: subcategories } = await supabase
    .from("categories")
    .select("id, name, slug, thumbnail_url, icon")
    .eq("parent_id", category.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(9);

  const subs = subcategories || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href={`/${locale}`} className="p-2 -ml-2 hover:bg-neutral-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <h1 className="font-semibold text-neutral-900">{category.name}</h1>
        </div>
      </div>

      {/* Subcategories Grid 3x3 */}
      <div className="p-4">
        {subs.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>No subcategories found</p>
            <Link 
              href={`/${locale}/products?category=${encodeURIComponent(category.name)}`}
              className="text-[#FF6A00] text-sm mt-2 inline-block"
            >
              View all products in {category.name} →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4">Select a subcategory</p>
            <div className="grid grid-cols-3 gap-3">
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${locale}/products?category=${encodeURIComponent(sub.name)}`}
                  className="bg-white rounded-xl p-3 border border-neutral-200 flex flex-col items-center gap-2 hover:border-[#FF6A00] transition active:scale-95"
                >
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {sub.thumbnail_url ? (
                      <img 
                        src={sub.thumbnail_url} 
                        alt={sub.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-700 text-center font-medium line-clamp-2 leading-tight">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* View all products button */}
        <Link
          href={`/${locale}/products?category=${encodeURIComponent(category.name)}`}
          className="mt-6 block w-full py-3 bg-[#FF6A00] text-white text-center rounded-xl font-medium hover:bg-[#e05e00] transition"
        >
          View all {category.name} products
        </Link>
      </div>
    </div>
  );
}
