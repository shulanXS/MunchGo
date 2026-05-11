import { useState } from 'react';
import { Utensils, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { restaurantApi } from '@/api/restaurant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { RestaurantStatus } from '@/types/enums';

const statusLabels: Record<RestaurantStatus, string> = {
  [RestaurantStatus.OPEN]: '营业中',
  [RestaurantStatus.CLOSED]: '已关闭',
  [RestaurantStatus.SUSPENDED]: '已停用',
};

const statusColors: Record<RestaurantStatus, string> = {
  [RestaurantStatus.OPEN]: 'bg-green-100 text-green-700',
  [RestaurantStatus.CLOSED]: 'bg-gray-100 text-gray-700',
  [RestaurantStatus.SUSPENDED]: 'bg-red-100 text-red-700',
};

export default function AdminRestaurantManagementPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<RestaurantStatus | ''>('');
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-restaurants', page, statusFilter],
    queryFn: () => restaurantApi.getRestaurants({
      page,
      size: 20,
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => restaurantApi.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      success('餐厅已删除');
    },
    onError: () => error('删除失败'),
  });

  const restaurants = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <DashboardLayout type="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">餐厅管理</h1>
        <Select
          value={statusFilter}
          onChange={v => { setStatusFilter(v as RestaurantStatus || ''); setPage(0); }}
          placeholder="全部状态"
          className="w-40"
        >
          <option value="">全部状态</option>
          <option value={RestaurantStatus.OPEN}>营业中</option>
          <option value={RestaurantStatus.CLOSED}>已关闭</option>
          <option value={RestaurantStatus.SUSPENDED}>已停用</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : restaurants.length === 0 ? (
        <EmptyState icon={<Utensils className="h-10 w-10" />} title="暂无餐厅" />
      ) : (
        <div className="space-y-3">
          {restaurants.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt={r.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{r.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{r.address}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      {r.cuisineType && <span>{r.cuisineType}</span>}
                      <span>起送 ¥{r.minOrderAmount}</span>
                      <span>评分 {r.rating.toFixed(1)}</span>
                      {r.ownerUsername && <span>店主: {r.ownerUsername}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/restaurants/${r.id}`)}>
                      <Eye className="h-4 w-4 mr-1" /> 查看
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { if (confirm(`确认删除餐厅 ${r.name}?`)) deleteMutation.mutate(r.id); }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>下一页</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
