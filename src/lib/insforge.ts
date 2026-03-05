import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});

export type Shop = {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: "active" | "suspended" | "pending";
  created_at: string;
  owner_email?: string;
  gst_number?: string;
  category?: string;
  logo_url?: string;
  business_hours?: string;
  plan_id?: string;
};

export type UserProfile = {
  id: string;
  shop_id: string | null;
  name: string;
  email: string;
  role: "super_admin" | "shop_owner" | "shop_staff" | "delivery_agent";
  created_at: string;
};

export type Product = {
  id: string;
  shop_id: string;
  name: string;
  selling_price: number;
  tax_percentage: number;
  stock_quantity: number;
  created_at: string;
  image_url?: string;
  category_id?: string;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  supplier_id?: string;
};

export type Sale = {
  id: string;
  shop_id: string;
  invoice_number: string;
  total_amount: number;
  payment_method: "Cash" | "UPI" | "Card" | "Wallet" | "Split";
  created_at: string;
  customer_id?: string;
  discount_amount?: number;
  tax_amount?: number;
  status?: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product; // for joins
  discount?: number;
  tax?: number;
};

export type GlobalCategory = {
  id: string;
  name: string;
  description?: string;
};

export type Customer = {
  id: string;
  shop_id: string;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points: number;
  credit_balance: number;
  created_at: string;
};

export type Supplier = {
  id: string;
  shop_id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
};

export type Purchase = {
  id: string;
  shop_id: string;
  supplier_id?: string;
  total_amount: number;
  payment_status: "pending" | "paid" | "partial";
  created_at: string;
};

export type PurchaseItem = {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  max_shops: number;
  max_users: number;
  monthly_price: number;
  features?: string;
};

export type AuditLog = {
  id: string;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  created_at: string;
};

export type Expense = {
  id: string;
  shop_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
};
