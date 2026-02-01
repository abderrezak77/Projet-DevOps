import { Product, Bid } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class AuctionService extends EventTarget {
  private products: Product[] = [];

  constructor() {
    super();
    this.loadProducts();
  }

  private async loadProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      
      const data = await response.json();
      this.products = data;
      this.dispatchEvent(new Event("update"));
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  async placeBid(
    productId: number,
    bid: Omit<Bid, "id" | "timestamp">
  ): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bid),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place bid");
      }

      const updatedProduct = await response.json();
      
      // Update local cache
      const index = this.products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        this.products[index] = updatedProduct;
      }
      
      this.dispatchEvent(new Event("update"));
      return updatedProduct;
    } catch (error) {
      console.error("Error placing bid:", error);
      throw error;
    }
  }

  async fetchProductWithBids(productId: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      
      const product = await response.json();
      
      // Update local cache
      const index = this.products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        this.products[index] = product;
      } else {
        this.products.push(product);
      }
      
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

}

export const auctionService = new AuctionService();
