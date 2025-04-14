export interface Product {
  _id: string;
  name: string;
  partNo: string;
  unitPrice: number;
  unitOfMeasure: string;
  description: string;
  active: boolean;
  image: string;
  customerPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerProduct extends Product {
  customerPrice: number;
  customerPriceId: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  product: Product | null;
  orderProducts: Product[];
  customerPrices: CustomerProduct[];
}

export interface CustomerProductPrice {
  productId: string;
  customerId: string;
  price: number;
}

export interface BulkAssignPayload {
  assignments: CustomerProductPrice[];
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  admin: boolean;
  createdAt?: string;
  updatedAt?: string;
} 