// Database Types (matching Supabase schema)
export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface DbBid {
  id: number;
  product_id: number;
  bidder_firstname: string;
  bidder_lastname: string;
  phone_number: string;
  amount: number;
  is_anonymous: boolean;
  created_at: string;
}

export interface DbProduct {
  id: number;
  title: string;
  description: string;
  starting_price: number;
  end_time: string;
  category_id: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Application Types (for frontend use)
export interface Bid {
  id: number;
  bidderName: string;
  phoneNumber: string;
  amount: number;
  isAnonymous: boolean;
  timestamp: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  endTime: number; // Unix timestamp
  bids: Bid[];
  bidsCount?: number; // Used on list view when bids array is empty
  category: string;
  active: boolean;
}

export type BidFormValues = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  amount: number | string; // number or '' when empty
  isAnonymous: boolean;
};

// Helper type for product with aggregated data from database
export interface ProductWithBids {
  id: number;
  title: string;
  description: string;
  images: string[];
  starting_price: number;
  current_price: number;
  end_time: string;
  category: string | null;
  bids_count: number;
  active: boolean;
  created_at: string;
}
