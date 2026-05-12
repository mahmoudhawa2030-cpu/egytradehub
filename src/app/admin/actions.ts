"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

// Generate a unique product slug by appending -2, -3, ... if needed.
// Pass excludeId to skip a row when updating an existing product.
async function generateUniqueProductSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  // cap attempts defensively
  for (let i = 0; i < 50; i++) {
    let q = supabase.from("products").select("id").eq("slug", candidate).limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    candidate = `${base}-${n++}`;
  }
  // fallback: timestamp suffix to guarantee uniqueness
  return `${base}-${Date.now()}`;
}

// ── Category Thumbnail Upload ─────────────────────────────────
export async function uploadCategoryThumbnail(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.size > 2 * 1024 * 1024) return { error: "File must be under 2 MB" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("category-thumbnails")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from("category-thumbnails")
    .getPublicUrl(path);

  return { url: publicUrl };
}

// ── Product Image Upload ──────────────────────────────────────
export async function uploadProductImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5 MB" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return { url: publicUrl };
}

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
    .update({ is_banned: true, is_verified: false })
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
  const { error } = await supabase.from("profiles").update({ is_banned: true }).eq("user_id", userId);
  if (error) throw new Error(`Ban failed: ${error.message}`);
  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_banned: false }).eq("user_id", userId);
  if (error) throw new Error(`Unban failed: ${error.message}`);
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
  revalidatePath("/", "layout");
  revalidatePath("/[locale]/products", "page");
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Determine caller role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  const isSupervisorOrAdmin = profile?.role === "admin" || profile?.role === "supervisor";

  // Supervisors/admins can assign an explicit supplier_id from the form;
  // fall back to their own id so the NOT NULL constraint is satisfied.
  const supplierIdField = (formData.get("supplier_id") as string) || "";
  const supplierId = isSupervisorOrAdmin
    ? (supplierIdField || user.id)
    : user.id;

  const name = formData.get("name") as string;
  const slug = await generateUniqueProductSlug(supabase, name);

  // Use admin client so supervisors bypass the "supplier_id = auth.uid()" RLS check
  const db = isSupervisorOrAdmin ? createAdminClient() : supabase;

  const { error } = await db.from("products").insert({
    supplier_id: supplierId,
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
    is_approved: isSupervisorOrAdmin, // Admins/supervisors auto-approve; suppliers need manual approval
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
  revalidatePath("/[locale]/products", "page");
  return { success: true };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;

  // Check current slug to decide whether to regenerate
  const { data: existing } = await supabase
    .from("products")
    .select("name, slug")
    .eq("id", productId)
    .maybeSingle();

  let slug = existing?.slug as string | undefined;
  if (!slug || existing?.name !== name) {
    slug = await generateUniqueProductSlug(supabase, name, productId);
  }

  const { error } = await supabase
    .from("products")
    .update({
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
  revalidatePath("/", "layout");
  revalidatePath("/[locale]/products", "page");
  return { success: true };
}

// ── Categories ────────────────────────────────────────────────
export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const parentId = (formData.get("parent_id") as string) || null;
  const { data, error } = await supabase.from("categories").insert({
    name,
    slug,
    parent_id: parentId,
    icon: (formData.get("icon") as string) || null,
    thumbnail_url: (formData.get("thumbnail_url") as string) || null,
    description: (formData.get("description") as string) || null,
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
    is_active: formData.get("is_active") !== "false",
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true, category: data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const parentId = (formData.get("parent_id") as string) || null;
  const { data, error } = await supabase.from("categories").update({
    name,
    slug,
    parent_id: parentId,
    icon: (formData.get("icon") as string) || null,
    thumbnail_url: (formData.get("thumbnail_url") as string) || null,
    description: (formData.get("description") as string) || null,
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
    is_active: formData.get("is_active") === "true",
  }).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true, category: data };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function toggleCategoryActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  await supabase.from("categories").update({ is_active }).eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

// ── RFQs ─────────────────────────────────────────────────────
export async function updateRfqStatus(rfqId: string, status: "pending" | "replied" | "closed") {
  const supabase = await createClient();
  await supabase.from("rfqs").update({ status }).eq("id", rfqId);
  revalidatePath("/admin/rfqs");
  revalidatePath("/admin/dashboard");
}

// ── Product Approval ─────────────────────────────────────────
export async function approveProduct(productId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ is_approved: true })
    .eq("id", productId);
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}
