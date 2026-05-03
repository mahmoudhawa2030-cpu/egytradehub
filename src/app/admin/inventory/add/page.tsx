import { createClient } from "@/lib/supabase/server";
import AddProductForm from "./AddProductForm";

export default async function AddProductPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = data?.map((c) => c.name) ?? [
    "Electronics", "Machinery", "Textiles", "Chemicals",
    "Safety", "Packaging", "Healthcare", "Logistics", "Other",
  ];

  return <AddProductForm categories={categories} />;
}
