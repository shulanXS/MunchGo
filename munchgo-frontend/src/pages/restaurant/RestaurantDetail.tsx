import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Phone, Clock, Star, Heart, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MenuItemCard } from '@/components/restaurant/MenuItemCard';
import { CategoryFilter } from '@/components/restaurant/CategoryFilter';
import { ReviewCard } from '@/components/review/ReviewCard';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useCart } from '@/hooks/useCart';
import { useToggleFavorite, useFavorites } from '@/hooks/useFavorite';
import { restaurantApi } from '@/api/restaurant';
import { reviewApi } from '@/api/review';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils';
import { RESTAURANT_STATUS_MAP } from '@/lib/constants';
import { MenuItem } from '@/types/menu';
import { cn } from '@/lib/utils';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(id!);
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', id],
    queryFn: () => restaurantApi.getCategories(Number(id)),
  });
  const { data: menuData } = useQuery({
    queryKey: ['menuItems', id],
    queryFn: () => restaurantApi.getMenu(Number(id)),
  });
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewApi.getRestaurantReviews(Number(id), { size: 5 }),
  });
  const { addItem } = useCart();
  const toggleFavorite = useToggleFavorite();
  const { data: favorites } = useFavorites();

  if (restaurantLoading) return <MainLayout><PageLoading /></MainLayout>;
  if (!restaurant) return <MainLayout><EmptyState title="餐厅不存在" /></MainLayout>;

  const categories = categoriesData || [];
  const menuItems = menuData || [];
  const reviews = reviewsData?.content || [];
  const statusInfo = RESTAURANT_STATUS_MAP[restaurant.status] || RESTAURANT_STATUS_MAP.CLOSED;
  const isFavorited = favorites?.some((f) => f.restaurantId === restaurant.id) || false;

  const filteredItems = selectedCategoryId
    ? menuItems.filter((item) => item.categoryId === selectedCategoryId)
    : menuItems;

  const handleAddToCart = (item: MenuItem) => {
    addItem(item.id, 1);
  };

  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-8xl">🍜</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{restaurant.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                {restaurant.cuisineType && <span className="text-white/80 text-sm">{restaurant.cuisineType}</span>}
              </div>
            </div>
            <button
              onClick={() => toggleFavorite.mutate(restaurant.id)}
              className="p-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
            >
              <Heart className={cn('h-5 w-5', isFavorited ? 'fill-red-500 text-red-500' : 'text-white')} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Star, label: '评分', value: `${(restaurant.rating ?? 0).toFixed(1)} (${restaurant.reviewCount ?? 0})` },
                { icon: Clock, label: '人均', value: formatPrice(restaurant.minOrderAmount ?? 0) },
                { icon: Truck, label: '配送费', value: formatPrice(restaurant.deliveryFee ?? 0) },
                { icon: MapPin, label: '地址', value: restaurant.address || '-' },
              ].map((item, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-3">
                  <item.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {restaurant.description && (
              <div>
                <h3 className="font-semibold mb-2">商家介绍</h3>
                <p className="text-sm text-muted-foreground">{restaurant.description}</p>
              </div>
            )}

            {/* Menu */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">菜单</h3>
                <span className="text-sm text-muted-foreground">{menuItems.length} 个菜品</span>
              </div>
              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
              )}
              <div className="mt-4 space-y-3">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                ))}
                {filteredItems.length === 0 && (
                  <EmptyState title="暂无菜品" description="该分类下暂无菜品" />
                )}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">用户评价</h3>
                <Button variant="outline" size="sm" onClick={() => navigate(`/restaurants/${id}/reviews`)}>
                  查看全部 →
                </Button>
              </div>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {reviews.length === 0 && <EmptyState title="暂无评价" description="还没有用户评价" />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold mb-3">店铺信息</h3>
              <div className="space-y-3 text-sm">
                {restaurant.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={() => navigate('/cart')}>
              查看购物车
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
