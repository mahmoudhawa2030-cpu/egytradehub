"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

async function generateUniqueProductSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase.from("products").select("id").eq("slug", candidate).limit(1);
    if (!data || data.length === 0) return candidate;
    candidate = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

// Dedicated action for suppliers to add products (always pending approval)
export async function createSupplierProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify user is a supplier
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "supplier") {
    return { error: "Only suppliers can add products" };
  }

  const name = formData.get("name") as string;
  const slug = await generateUniqueProductSlug(supabase, name);

  const { error } = await supabase.from("products").insert({
    supplier_id: user.id,
    name,
    slug,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    base_price: parseFloat(formData.get("base_price") as string),
    moq: parseInt(formData.get("moq") as string, 10),
    image_url: (formData.get("image_url") as string) || null,
    gallery_images: (() => { try { return JSON.parse((formData.get("gallery_images") as string) || "[]"); } catch { return []; } })(),
    sample_price: formData.get("sample_price") ? parseFloat(formData.get("sample_price") as string) : null,
    specifications: (() => { try { const s = formData.get("specifications") as string; return s ? JSON.parse(s) : null; } catch { return null; } })(),
    is_approved: false, // EXPLICITLY false - requires admin approval
    is_flash_deal: formData.get("is_flash_deal") === "true",
    flash_discount_pct: formData.get("flash_discount_pct")
      ? parseFloat(formData.get("flash_discount_pct") as string)
      : null,
    flash_starts_at: (formData.get("flash_starts_at") as string) || null,
    flash_ends_at: (formData.get("flash_ends_at") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
  revalidatePath("/supplier/dashboard");
  return { success: true, isApproved: false };
}
