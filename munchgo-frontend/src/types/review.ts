export interface Review {
  id: number;
  userId: number;
  username?: string;
  userAvatar?: string;
  restaurantId: number;
  orderId?: number;
  rating: number;
  content: string;
  images?: string[];
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}
