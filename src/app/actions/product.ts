'use server'

export async function submitInquiry(data: {
  productId: string;
  productName: string;
  supplierId: string;
  quantity: number;
  targetPrice: number | null;
  notes: string;
}): Promise<{ success: true } | { error: string }> {
  return { error: 'Not available in static build' };
}

export async function startChat(data: {
  supplierId: string;
  productId: string;
  productName: string;
  message: string;
}): Promise<{ success: true } | { error: string }> {
  return { error: 'Not available in static build' };
}
