import { createClient } from "@/lib/supabase/server";
import AddProductForm from "./AddProductForm";

export default async function AddProductPage() {
  const supabase = await createClient();

  const [categoriesRes, profileRes, suppliersRes] = await Promise.all([
    supabase.from("categories").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
      return data;
    }),
    supabase.from("profiles").select("user_id, full_name, company_name").eq("role", "supplier").order("company_name", { ascending: true }),
  ]);

  const categories = categoriesRes.data?.map((c) => c.name) ?? [
    "Electronics", "Machinery", "Textiles", "Chemicals",
    "Safety", "Packaging", "Healthcare", "Logistics", "Other",
  ];

  const role = profileRes?.role ?? "buyer";
  const suppliers = (suppliersRes.data ?? []) as { user_id: string; full_name: string | null; company_name: string | null }[];

  return <AddProductForm categories={categories} role={role} suppliers={suppliers} />;
}
