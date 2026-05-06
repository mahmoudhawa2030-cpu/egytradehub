import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SupplierAddProductForm from "./SupplierAddProductForm";

export default async function SupplierAddProductPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/en/login");

  const { data } = await supabase
    .from("categories")
    .select("name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = data?.map((c) => c.name) ?? [
    "Electronics", "Machinery", "Textiles", "Chemicals",
    "Safety", "Packaging", "Healthcare", "Logistics", "Other",
  ];

  return <SupplierAddProductForm categories={categories} />;
}
