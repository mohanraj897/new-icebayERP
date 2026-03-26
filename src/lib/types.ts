export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller';
  phone?: string;
  address?: string;
}

export interface Category {
  _id: string;
  name: string;
  type: 'milk-based' | 'water-based';
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  categoryId: string | Category;
  price: number;
  cost?: number;
  quantity: number;
  sku?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesReport {
  _id: string;
  date: Date;
  totalSales: number;
  totalOrders: number;
  topSellingItem?: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    sales: number;
    quantity: number;
  }>;
  paymentBreakdown: {
    cash: number;
    card: number;
    upi: number;
  };
  createdAt: Date;
}
