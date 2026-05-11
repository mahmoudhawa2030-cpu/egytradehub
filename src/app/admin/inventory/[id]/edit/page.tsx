import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProductForm from "./EditProductForm";

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: catData } = await supabase
    .from("categories")
    .select("name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = catData?.map((c) => c.name) ?? [
    "Electronics", "Machinery", "Textiles", "Chemicals",
    "Safety", "Packaging", "Healthcare", "Logistics", "Other",
  ];

  return <EditProductForm product={product} categories={categories} />;
}
