import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { SearchBar } from '@/components/common/SearchBar';
import { Pagination } from '@/components/common/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useRestaurants } from '@/hooks/useRestaurant';
import { RestaurantStatus } from '@/types/enums';
import { Search } from 'lucide-react';

export default function RestaurantSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const statusParam = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const size = 12;

  const { data, isLoading } = useRestaurants({
    keyword: keyword || undefined,
    status: statusParam as RestaurantStatus || undefined,
    page: page - 1,
    size,
  });

  const restaurants = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const handleSearch = (kw: string) => {
    setSearchParams((prev) => {
      prev.set('keyword', kw);
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(newPage));
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchBar
            value={keyword}
            onChange={handleSearch}
            placeholder="搜索餐厅名称、美食..."
            className="flex-1"
          />
          <Select
            value={statusParam || ''}
            onChange={(v) => {
              setSearchParams((prev) => {
                if (v) prev.set('status', v);
                else prev.delete('status');
                prev.set('page', '1');
                return prev;
              });
            }}
            placeholder="餐厅状态"
          >
            <option value="">全部</option>
            <option value={RestaurantStatus.OPEN}>营业中</option>
            <option value={RestaurantStatus.CLOSED}>已打烊</option>
          </Select>
        </div>

        {keyword && (
          <p className="mb-4 text-sm text-muted-foreground">
            搜索 "<span className="font-medium text-foreground">{keyword}</span>" ，
            找到 {totalElements} 个结果
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-40 rounded-t-lg" />
                <Skeleton className="h-28 rounded-b-lg mt-1" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title="没有找到餐厅"
            description="换个关键词试试吧"
            action={
              keyword && (
                <Button variant="outline" onClick={() => handleSearch('')}>
                  清除搜索
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={size}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
