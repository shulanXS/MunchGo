import { OrderStatus } from './enums';
import { Address } from './address';
import { Restaurant } from './restaurant';

export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  restaurantId: number;
  restaurantName?: string;
  restaurant?: Restaurant;
  riderId?: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  finalAmount: number;
  deliveryAddress?: Address;
  remark?: string;
  items: OrderItem[];
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  cartId: number;
  deliveryAddressId: number;
  remark?: string;
}
