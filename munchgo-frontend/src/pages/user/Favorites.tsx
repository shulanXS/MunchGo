import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorite';
import { useRestaurants } from '@/hooks/useRestaurant';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favorites, isLoading } = useFavorites();
  const { data: allRestaurants } = useRestaurants({ size: 100 });
  const toggleFavorite = useToggleFavorite();

  const favoriteRestaurants = allRestaurants?.content.filter((r) =>
    favorites?.some((f) => f.restaurantId === r.id)
  ) || [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">我的收藏</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><Skeleton className="h-48 rounded-xl" /></div>
            ))}
          </div>
        ) : favoriteRestaurants.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-12 w-12" />}
            title="暂无收藏"
            description="收藏你喜欢的餐厅，方便下次快速找到"
            action={<Button onClick={() => navigate('/restaurants')}>去逛逛</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
