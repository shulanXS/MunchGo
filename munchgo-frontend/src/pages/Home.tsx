import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRestaurants } from '@/hooks/useRestaurant';
import { RestaurantStatus } from '@/types/enums';

export default function HomePage() {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { data, isLoading } = useRestaurants({ keyword: keyword || undefined, status: RestaurantStatus.OPEN, size: 8 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/restaurants?keyword=${encodeURIComponent(keyword)}`);
  };

  const featuredRestaurants = data?.content || [];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            发现美味，<span className="text-primary">轻松下单</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            汇聚附近万千餐厅，提供外卖、堂食等多种服务，让美食触手可及
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <SearchBar
              value={keyword}
              onChange={setKeyword}
              placeholder="搜索餐厅、美食..."
              className="shadow-lg"
            />
          </form>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> 覆盖全城
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" /> 精选餐厅
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> 每日优惠
            </span>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">热门餐厅</h2>
          <Button variant="ghost" onClick={() => navigate('/restaurants')}>
            查看全部 →
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-40 rounded-t-lg" />
                <Skeleton className="h-24 rounded-b-lg mt-1" />
              </div>
            ))}
          </div>
        ) : featuredRestaurants.length === 0 ? (
          <EmptyState
            title="暂无餐厅"
            description="还没有餐厅入驻，快去其他区域看看吧"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Quick Access */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">美食分类</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {[
            { emoji: '🍜', name: '中式', path: '/restaurants?cuisine=中餐' },
            { emoji: '🍔', name: '汉堡', path: '/restaurants?cuisine=快餐' },
            { emoji: '🍣', name: '日料', path: '/restaurants?cuisine=日料' },
            { emoji: '🍕', name: '披萨', path: '/restaurants?cuisine=披萨' },
            { emoji: '🍦', name: '甜点', path: '/restaurants?cuisine=甜品' },
            { emoji: '☕', name: '饮品', path: '/restaurants?cuisine=饮品' },
          ].map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(cat.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted transition-colors"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
