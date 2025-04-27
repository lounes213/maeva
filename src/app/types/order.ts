// utils/orderUtils.ts
export const generateTrackingCode = () => {
  const prefix = 'CMD';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
  color?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  customer: {
    name: string;
    address: string;
    contact: string;
    email?: string;
  };
  shipping: {
    method: string;
    cost: number;
    estimatedDelivery: string;
  };
  payment: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  trackingCode: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt: string;
}