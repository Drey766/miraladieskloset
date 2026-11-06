export type CategorySlug =
  | "running"
  | "skate"
  | "court"
  | "hiking"
  | "training"
  | "basketball"
  | "walking"
  | "lifestyle";

export type Gender = "men" | "women" | "unisex" | "kids";

export interface ProductFeature {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  images: string[];
  color: string;
  sizes: string[];
  category: CategorySlug;
  gender: Gender;
  features: ProductFeature[];
  sku: string;
  is_featured: boolean;
  is_new: boolean;
  is_clearance: boolean;
  in_stock: boolean;
  /** Optional — set `"low_stock": true` on a product in products.json to show the "Almost out" badge. */
  low_stock?: boolean;
  rating: number;
  review_count: number;
}

export interface CartItem {
  product: Product;
  selected_size: string;
  quantity: number;
}

export type Fulfilment = "pickup" | "delivery";
export type PaymentMethod = "mpesa" | "on-delivery";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  published_at: string; // ISO date
  read_time: number; // minutes
  /** Product id whose first photo is used as the cover. */
  cover_product_id?: string;
  content: string; // HTML
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
}

/** What the checkout page sends to /api/orders. Prices are NOT sent — the server recomputes them. */
export interface OrderRequest {
  customer: {
    name: string;
    phone: string;
    county?: string;
    town?: string;
    address?: string;
  };
  fulfilment: Fulfilment;
  payment: PaymentMethod;
  items: { product_id: string; selected_size: string; quantity: number }[];
}

export interface OrderResponse {
  ok: boolean;
  orderId?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  stkSent?: boolean;
  whatsappSent?: boolean;
  checkoutRequestId?: string;
  error?: string;
  /** Message the checkout page can show to the shopper as-is. */
  message?: string;
}
