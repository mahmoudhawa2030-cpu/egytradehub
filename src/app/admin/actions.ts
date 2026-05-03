"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Suppliers ────────────────────────────────────────────────
export async function verifySupplier(userId: string) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ is_verified: true })
    .eq("user_id", userId);
  revalidatePath("/admin/suppliers");
}

export async function rejectSupplier(userId: string) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ is_verified: false, role: "buyer" })
    .eq("user_id", userId);
  revalidatePath("/admin/suppliers");
}

export async function suspendUser(userId: string) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: "buyer", is_verified: false })
    .eq("user_id", userId);
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/users");
}

// ── Users ────────────────────────────────────────────────────
export async function changeUserRole(userId: string, role: "buyer" | "supplier" | "admin") {
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("user_id", userId);
  revalidatePath("/admin/users");
}

// ── Orders ───────────────────────────────────────────────────
export async function updateOrderStatus(
  orderId: string,
  status: "processing" | "in_transit" | "delivered" | "cancelled"
) {
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
}

// ── Products ─────────────────────────────────────────────────
export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/inventory");
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("products").insert({
    supplier_id: user.id,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    base_price: parseFloat(formData.get("base_price") as string),
    moq: parseInt(formData.get("moq") as string, 10),
    image_url: (formData.get("image_url") as string) || null,
    is_flash_deal: formData.get("is_flash_deal") === "true",
    flash_discount_pct: formData.get("flash_discount_pct")
      ? parseFloat(formData.get("flash_discount_pct") as string)
      : null,
    flash_starts_at: (formData.get("flash_starts_at") as string) || null,
    flash_ends_at: (formData.get("flash_ends_at") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      base_price: parseFloat(formData.get("base_price") as string),
      moq: parseInt(formData.get("moq") as string, 10),
      image_url: (formData.get("image_url") as string) || null,
      is_flash_deal: formData.get("is_flash_deal") === "true",
      flash_discount_pct: formData.get("flash_discount_pct")
        ? parseFloat(formData.get("flash_discount_pct") as string)
        : null,
      flash_starts_at: (formData.get("flash_starts_at") as string) || null,
      flash_ends_at: (formData.get("flash_ends_at") as string) || null,
    })
    .eq("id", productId);

  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

// ── RFQs ─────────────────────────────────────────────────────
export async function updateRfqStatus(rfqId: string, status: "pending" | "replied" | "closed") {
  const supabase = await createClient();
  await supabase.from("rfqs").update({ status }).eq("id", rfqId);
  revalidatePath("/admin/rfqs");
  revalidatePath("/admin/dashboard");
}
