export interface Category {
  id: number;
  restaurantId: number;
  name: string;
  sortOrder: number;
  menuItemCount?: number;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  tags?: string;
  createdAt: string;
}
