
export enum OrderStatus {
  PENDING = 'pending',
  SETTLEMENT = 'settlement',
  EXPIRED = 'expired'
}

export enum AccountStatus {
  AVAILABLE = 'available',
  SOLD = 'sold'
}

export interface AppProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

export interface Account {
  id: string;
  app_id: string;
  email: string;
  password?: string;
  status: AccountStatus;
}

export interface Order {
  id: string;
  order_id: string;
  app_id: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  qr_url?: string;
  created_at: string;
  delivered_accounts?: string[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  video_url?: string;
}
