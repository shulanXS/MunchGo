export interface Cart {
  id: number;
  userId: number;
  restaurantId: number;
  restaurantName?: string;
  deliveryFee?: number;
  items: CartItem[];
  totalAmount: number;
}

export interface CartItem {
  id: number;
  menuItemId: number;
  restaurantId?: number;
  name?: string;
  imageUrl?: string;
  menuItemName?: string;
  menuItemImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartItemRequest {
  menuItemId: number;
  quantity: number;
}
