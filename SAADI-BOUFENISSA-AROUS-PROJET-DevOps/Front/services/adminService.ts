const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface AdminProduct {
  id: number;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  endTime: string;
  category: string;
  categoryId: number | null;
  active: boolean;
  bidsCount: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  startingPrice: number;
  endTime: string;
  categoryId: number | null;
  images: string[];
}

export interface UpdateProductData extends CreateProductData {
  active: boolean;
}

class AdminService {
  async getAllProducts(): Promise<AdminProduct[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return await response.json();
    } catch (error) {
      console.error("Error fetching admin products:", error);
      throw error;
    }
  }

  async createProduct(data: CreateProductData): Promise<{ id: number; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
