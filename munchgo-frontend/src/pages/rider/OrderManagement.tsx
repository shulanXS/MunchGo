import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { MapPin, Navigation } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrder';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';

const TABS = [
  { value: '', label: '全部' },
  { value: OrderStatus.READY, label: '待取货' },
  { value: OrderStatus.DELIVERING, label: '配送中' },
  { value: OrderStatus.COMPLETED, label: '已完成' },
];

export default function RiderOrderManagementPage() {
  const [tab, setTab] = useState<string>('');
  const [page, setPage] = useState(1);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const { data, isLoading } = useOrders({
    status: tab ? (tab as OrderStatus) : undefined,
    role: 'RIDER',
    page: page - 1,
    size: 10,
  });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const handleAccept = (orderId: number) => {
    updateStatus.mutate(
      { id: orderId, status: OrderStatus.DELIVERING },
      { onSuccess: () => success('已接单，开始配送'), onError: () => error('操作失败') }
    );
  };

  const handleComplete = (orderId: number) => {
    updateStatus.mutate(
      { id: orderId, status: OrderStatus.COMPLETED },
      { onSuccess: () => success('配送已完成'), onError: () => error('操作失败') }
    );
  };

  return (
    <DashboardLayout type="rider">
      <h1 className="text-xl font-bold mb-4">我的配送</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(t => (
          <Button
            key={t.value}
            size="sm"
            variant={tab === t.value ? 'default' : 'outline'}
            onClick={() => { setTab(t.value); setPage(1); }}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">订单号: {order.orderNo}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold text-primary">{formatPrice(order.finalAmount)}</span>
                </div>
              </div>

              {order.deliveryAddress && (
                <div className="flex items-start gap-1.5 mb-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span className="truncate">
                    {order.deliveryAddress.label} {order.deliveryAddress.detail}
                    {order.deliveryAddress.contactName && ` (${order.deliveryAddress.contactName} ${order.deliveryAddress.contactPhone})`}
                  </span>
                </div>
              )}

              {order.restaurantName && (
                <div className="flex items-start gap-1.5 mb-2 text-sm text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>取餐地址: {order.restaurantName}</span>
                </div>
              )}

              <div className="text-sm text-muted-foreground mb-3">
                {order.items.map((item, i) => (
                  <span key={i}>{item.name} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  配送费: {formatPrice(order.deliveryFee ?? 0)}
                </span>
                <div className="flex gap-2">
                  {order.status === OrderStatus.READY && (
                    <Button size="sm" onClick={() => handleAccept(order.id)}>
                      接单配送
                    </Button>
                  )}
                  {order.status === OrderStatus.DELIVERING && (
                    <Button size="sm" onClick={() => handleComplete(order.id)}>
                      确认送达
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/orders/${order.id}`)}>
                    查看详情
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && !isLoading && (
          <EmptyState
            title="暂无配送订单"
            description={tab ? `没有${TABS.find(t => t.value === tab)?.label}的订单` : '还没有任何配送任务'}
            action={
              tab ? (
                <Button variant="outline" onClick={() => setTab('')}>查看全部</Button>
              ) : (
                <Button variant="outline" onClick={() => navigate('/rider/pool')}>去接单</Button>
              )
            }
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
