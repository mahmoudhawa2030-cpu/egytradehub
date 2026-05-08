"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitRFQ(data: {
  product_name: string;
  quantity: number;
  target_price: number | null;
  country: string;
  notes: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "not_authenticated" };

  const { error } = await supabase.from("rfqs").insert({
    buyer_id: user.id,
    product_name: data.product_name,
    quantity: data.quantity,
    target_price: data.target_price,
    country: data.country || null,
    notes: data.notes || null,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/rfqs");
  return { success: true };
}
