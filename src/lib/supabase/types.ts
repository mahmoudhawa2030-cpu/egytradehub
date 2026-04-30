export type ProfileRole = "buyer" | "supplier" | "admin";

export type Profile = {
  user_id: string;
  role: ProfileRole;
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  is_verified: boolean;
  created_at: string;
};

export type PriceTier = {
  min_qty: number;
  max_qty: number | null;
  price: number;
};

export type Product = {
  id: string;
  supplier_id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  moq: number;
  image_url: string | null;
  price_tiers: PriceTier[] | null;
  is_flash_deal: boolean;
  flash_starts_at: string | null;
  flash_ends_at: string | null;
  flash_discount_pct: number | null;
  stock_claimed_pct: number | null;
  created_at: string;
};

export type RfqStatus = "pending" | "replied" | "closed";

export type Rfq = {
  id: string;
  buyer_id: string;
  product_name: string;
  quantity: number;
  target_price: number | null;
  country: string | null;
  notes: string | null;
  status: RfqStatus;
  created_at: string;
};

export type OrderStatus = "processing" | "in_transit" | "delivered" | "cancelled";

export type Order = {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: OrderStatus;
  tracking_details: Record<string, unknown> | null;
  created_at: string;
};
