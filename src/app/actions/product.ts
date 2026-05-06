"use server";

import { createClient } from "@/lib/supabase/server";

// ── Send Inquiry (inserts into rfqs) ─────────────────────────────────────────
export async function submitInquiry(data: {
  productId: string;
  productName: string;
  supplierId: string;
  quantity: number;
  targetPrice: number | null;
  notes: string;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { error } = await supabase.from("rfqs").insert({
    buyer_id: user.id,
    product_id: data.productId,
    supplier_id: data.supplierId,
    product_name: data.productName,
    quantity: data.quantity,
    target_price: data.targetPrice,
    notes: data.notes || null,
    status: "pending",
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ── Start Chat (inserts first message, returns room_id) ───────────────────────
export async function startChat(data: {
  supplierId: string;
  productId: string;
  productName: string;
  message: string;
}): Promise<{ roomId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  // Canonical room id: sorted pair so buyer→supplier and supplier→buyer share the same room
  const ids = [user.id, data.supplierId].sort();
  const roomId = `product:${data.productId}:${ids[0]}:${ids[1]}`;

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: data.supplierId,
    room_id: roomId,
    content: data.message,
  });

  if (error) return { error: error.message };
  return { roomId };
}
