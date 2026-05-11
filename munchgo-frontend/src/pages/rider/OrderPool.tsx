import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, MapPin, Navigation, ArrowRight, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { orderApi } from '@/api/order';
import { useUpdateOrderStatus } from '@/hooks/useOrder';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RiderOrderPoolPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [page, setPage] = useState(0);
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['rider-pool', page],
    queryFn: () => orderApi.getAvailableOrders({ page, size: 20 }),
    initialData: () => ({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20, first: true, last: true }),
  });

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const handleAccept = (orderId: number) => {
    updateStatus.mutate(
      { id: orderId, status: OrderStatus.DELIVERING },
      {
        onSuccess: () => {
          success('接单成功，开始配送');
          queryClient.invalidateQueries({ queryKey: ['rider-pool'] });
        },
        onError: (err: any) => {
          error(err?.response?.data?.message || err?.message || '接单失败，该订单可能已被其他骑手接走');
        },
      }
    );
  };

  return (
    <DashboardLayout type="rider">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">接单池</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {totalElements} 个可接配送订单
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-32 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="暂无可接订单"
          description="暂时没有新的配送任务，请稍后再来"
          action={
            <Button variant="outline" onClick={() => refetch()}>
              刷新
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">订单号: {order.orderNo}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                      待取货
                    </Badge>
                  </div>

                  {order.restaurantName && (
                    <div className="flex items-start gap-1.5 mb-2 text-sm text-muted-foreground">
                      <Navigation className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>取餐: {order.restaurantName}</span>
                    </div>
                  )}

                  {order.deliveryAddress && (
                    <div className="flex items-start gap-1.5 mb-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span className="truncate">
                        {order.deliveryAddress.label} {order.deliveryAddress.detail}
                        {order.deliveryAddress.contactName && ` (${order.deliveryAddress.contactName} ${order.deliveryAddress.contactPhone})`}
                      </span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground mb-3">
                    {order.items.map((item, i) => (
                      <span key={i}>{item.name} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">配送费:</span>
                      <span className="font-semibold text-green-600">{formatPrice(order.deliveryFee ?? 0)}</span>
                      <span className="text-muted-foreground">订单金额:</span>
                      <span className="font-semibold text-primary">{formatPrice(order.finalAmount)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        variant="ghost"
                      >
                        查看详情
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(order.id)}
                        disabled={updateStatus.isPending}
                      >
                        接单配送
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(p => p - 1)}>
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page + 1} / {totalPages} 页
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
