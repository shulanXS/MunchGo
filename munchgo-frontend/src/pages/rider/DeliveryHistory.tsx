import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { MapPin, Navigation } from 'lucide-react';
import { useOrders } from '@/hooks/useOrder';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';

export default function RiderDeliveryHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');

  const { data, isLoading } = useOrders({
    status: OrderStatus.COMPLETED,
    role: 'RIDER',
    page: page - 1,
    size: 10,
  });

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const totalEarnings = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const allTimeEarnings = orders.length === totalElements
    ? totalEarnings
    : orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  const displayedEarnings = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  const filteredOrders = dateFilter
    ? orders.filter(o => o.completedAt?.startsWith(dateFilter) || o.updatedAt?.startsWith(dateFilter))
    : orders;

  return (
    <DashboardLayout type="rider">
      <h1 className="text-xl font-bold mb-6">配送历史</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本页配送收入</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(displayedEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本页完成订单</p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">当前页总收入</p>
                <p className="text-2xl font-bold">{formatPrice(totalEarnings)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <Input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          className="w-48"
          placeholder="按日期筛选"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-24 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="暂无配送记录"
          description={dateFilter ? '该日期没有配送记录' : '还没有完成任何配送任务'}
        />
      ) : (
        <>
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">订单号: {order.orderNo}</p>
                      <p className="text-xs text-muted-foreground">
                        完成于: {order.paidAt ? formatDateTime(order.paidAt) : formatDateTime(order.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold text-primary">{formatPrice(order.finalAmount)}</span>
                    </div>
                  </div>

                  {order.restaurantName && (
                    <div className="flex items-start gap-1.5 mb-2 text-sm text-muted-foreground">
                      <Navigation className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>{order.restaurantName}</span>
                    </div>
                  )}

                  {order.deliveryAddress && (
                    <div className="flex items-start gap-1.5 mb-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span className="truncate">
                        {order.deliveryAddress.label} {order.deliveryAddress.detail}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">配送费: </span>
                      <span className="font-semibold text-green-600">{formatPrice(order.deliveryFee ?? 0)}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/orders/${order.id}`)}>
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
