export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductPayload = {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
  image_url?: string;
  published: boolean;
};
