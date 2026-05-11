// Stub for static export build - original file moved to rfq.ts.disabled

export async function submitRFQ(data: {
  product_name: string;
  quantity: number;
  target_price?: number | null;
  country: string;
  notes?: string;
}) {
  console.log("submitRFQ stub called", data);
  return { error: "Not available in offline mode" };
}
