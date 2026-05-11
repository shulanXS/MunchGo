import { RestaurantStatus } from './enums';

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  cuisineType?: string;
  rating: number;
  imageUrl?: string;
  status: RestaurantStatus;
  minOrderAmount: number;
  deliveryFee: number;
  ownerId: number;
  ownerUsername?: string;
  reviewCount: number;
  createdAt: string;
}

export interface RestaurantStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  avgRating: number;
}
