// API configuration and utilities for backend communication
import { API_BASE_URL } from './config';

export interface ApiError {
  detail: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  image_url?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: 'An error occurred',
        }));
        throw new Error(error.detail);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  }

  async register(email: string, username: string, password: string): Promise<User> {
    return this.request<User>('/user/registration', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  // Cart endpoints
  async getCart(): Promise<CartItem[]> {
    return this.request<CartItem[]>('/cart');
  }

  async addToCart(productId: number, quantity: number = 1): Promise<CartItem> {
    return this.request<CartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    return this.request<CartItem>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number): Promise<void> {
    return this.request<void>(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async createOrder(): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
    });
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }
}

export const api = new ApiClient();
