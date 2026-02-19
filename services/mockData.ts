
import { AppProduct, Account, AccountStatus, Order, OrderStatus, Tutorial } from '../types';
import { PAYMENT_BASE_URL, PAYMENT_API_KEY } from '../constants';
import { supabase } from './supabase';

export const mockDb = {
  getProducts: async (): Promise<AppProduct[]> => {
    const { data, error } = await supabase.from('apps').select('*');
    if (error) throw error;
    return data || [];
  },

  getProduct: async (id: string): Promise<AppProduct | undefined> => {
    const { data, error } = await supabase.from('apps').select('*').eq('id', id).single();
    if (error) return undefined;
    return data;
  },

  getTutorials: async (): Promise<Tutorial[]> => {
    const { data, error } = await supabase.from('tutorials').select('*');
    if (error) throw error;
    return data || [];
  },

  getAvailableAccountsCount: async (productId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', productId)
      .eq('status', AccountStatus.AVAILABLE);
    if (error) return 0;
    return count || 0;
  },

  createOrder: async (productId: string, quantity: number, total: number): Promise<Order> => {
    // 1. Call Payment API
    const response = await fetch(`${PAYMENT_BASE_URL}/api/payment/deposit?apikey=${PAYMENT_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total })
    });
    
    if (!response.ok) throw new Error("Gagal menghubungi server pembayaran.");
    const paymentData = await response.json();
    
    // 2. Insert Order into Supabase
    const { data, error } = await supabase.from('orders').insert({
      order_id: paymentData.orderId,
      app_id: productId,
      quantity,
      total: paymentData.amountToPay || total,
      status: OrderStatus.PENDING,
      qr_url: paymentData.qrCodeUrl,
      created_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return data;
  },

  getOrderStatus: async (orderId: string): Promise<OrderStatus> => {
    try {
      const response = await fetch(`${PAYMENT_BASE_URL}/api/payment/status/${orderId}?apikey=${PAYMENT_API_KEY}`);
      if (!response.ok) return OrderStatus.PENDING;
      
      const data = await response.json();
      if (data.status === 'settlement') return OrderStatus.SETTLEMENT;
      if (data.status === 'expired') return OrderStatus.EXPIRED;
      return OrderStatus.PENDING;
    } catch (error) {
      return OrderStatus.PENDING;
    }
  },

  setOrderSettled: async (orderId: string): Promise<string[]> => {
    // Check if already settled in DB to avoid double processing
    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
    if (orderErr || !order) return [];
    if (order.status === OrderStatus.SETTLEMENT) return order.delivered_accounts || [];

    // Get available accounts
    const { data: available, error: accErr } = await supabase
      .from('accounts')
      .select('*')
      .eq('app_id', order.app_id)
      .eq('status', AccountStatus.AVAILABLE)
      .limit(order.quantity);

    if (accErr || !available || available.length < order.quantity) {
      throw new Error("Stok habis saat pemrosesan settlement.");
    }

    const accountDetails = available.map(a => `${a.email}:${a.password}`);
    const accountIds = available.map(a => a.id);

    // Update accounts status to SOLD
    const { error: updateAccErr } = await supabase
      .from('accounts')
      .update({ status: AccountStatus.SOLD })
      .in('id', accountIds);
    
    if (updateAccErr) throw updateAccErr;

    // Update order status and attach delivered accounts
    const { error: updateOrderErr } = await supabase
      .from('orders')
      .update({ 
        status: OrderStatus.SETTLEMENT,
        delivered_accounts: accountDetails 
      })
      .eq('order_id', orderId);

    if (updateOrderErr) throw updateOrderErr;

    return accountDetails;
  },

  // Admin Ops
  getAllOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  addAccountsBulk: async (appId: string, accounts: { email: string; pass: string }[]) => {
    const payload = accounts.map(acc => ({
      app_id: appId,
      email: acc.email,
      password: acc.pass,
      status: AccountStatus.AVAILABLE
    }));
    const { error } = await supabase.from('accounts').insert(payload);
    if (error) throw error;
  },

  deleteApp: async (id: string) => {
    const { error } = await supabase.from('apps').delete().eq('id', id);
    if (error) throw error;
  },

  addApp: async (product: AppProduct) => {
    const { error } = await supabase.from('apps').insert(product);
    if (error) throw error;
  },

  updateProduct: async (id: string, updates: Partial<AppProduct>) => {
    const { error } = await supabase.from('apps').update(updates).eq('id', id);
    if (error) throw error;
  },

  addTutorial: async (tutorial: Tutorial) => {
    const { error } = await supabase.from('tutorials').insert(tutorial);
    if (error) throw error;
  },

  deleteTutorial: async (id: string) => {
    const { error } = await supabase.from('tutorials').delete().eq('id', id);
    if (error) throw error;
  },

  verifyAdmin: async (username: string, pass: string): Promise<boolean> => {
    // As per requirement: "Admin login pakai sistem manual table admins."
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('password_hash', pass) // In a real production app, use actual hashing comparison
      .single();
    
    if (error || !data) return false;
    return true;
  }
};
