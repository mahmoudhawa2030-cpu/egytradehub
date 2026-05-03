import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, icon, description, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Categories</h1>
        <p className="text-neutral-500 mt-1">Manage product categories shown across the platform</p>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error.message}
        </div>
      )}
      <CategoriesClient categories={data ?? []} />
    </div>
  );
}
