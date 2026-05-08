import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import SupplierEditProductForm from "./SupplierEditProductForm";

export default async function SupplierEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/en/login");

  const [productRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, description, category, base_price, moq, sample_price, image_url, gallery_images, is_flash_deal, flash_discount_pct, flash_starts_at, flash_ends_at, supplier_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  const product = productRes.data;
  if (!product) notFound();

  // Ownership check — supplier can only edit their own products
  if (product.supplier_id !== user.id) {
    redirect("/supplier/dashboard");
  }

  const categories = categoriesRes.data?.map((c) => c.name) ?? [
    "Electronics", "Machinery", "Textiles", "Chemicals",
    "Safety", "Packaging", "Healthcare", "Logistics", "Other",
  ];

  return <SupplierEditProductForm product={product} categories={categories} />;
}
