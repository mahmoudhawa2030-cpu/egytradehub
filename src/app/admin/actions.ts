"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function banUser(userId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_banned: true }).eq("user_id", userId);
  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_banned: false }).eq("user_id", userId);
  revalidatePath("/admin/users");
}

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string; company_name?: string; country?: string; role?: string; is_verified?: boolean }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(data).eq("user_id", userId);
  revalidatePath("/admin/users");
  if (error) return { error: error.message };
  return { success: true };
}

export async function createAdminUser(formData: FormData) {
  const adminSupabase = createAdminClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const company_name = (formData.get("company_name") as string) || null;
  const country = (formData.get("country") as string) || null;
  const role = (formData.get("role") as string) || "buyer";

  if (!email || !password) return { error: "Email and password are required" };

  const { data: signUpData, error: signUpError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (signUpError) return { error: signUpError.message };

  const newUserId = signUpData.user?.id;
  if (!newUserId) return { error: "Failed to create user" };

  const { error: profileError } = await adminSupabase.from("profiles").upsert({
    user_id: newUserId,
    full_name,
    company_name,
    country,
    role,
    is_verified: role === "supplier" ? false : true,
    is_banned: false,
  });

  if (profileError) return { error: profileError.message };
  return { success: true };
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
