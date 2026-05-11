import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrder';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';
import { useToast } from '@/hooks/useToast';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { MapPin, User, Utensils } from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

const ALL_STATUSES_FOR_ADMIN: { value: string; label: string }[] = [
  { value: '', label: '全部状态' },
  ...ALL_STATUSES.map(s => ({
    value: s,
    label: ORDER_STATUS_MAP[s]?.label || s,
  })),
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.READY,
  [OrderStatus.READY]: OrderStatus.DELIVERING,
  [OrderStatus.DELIVERING]: OrderStatus.COMPLETED,
};

export default function AdminOrderManagementPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const { success, error } = useToast();

  const { data, isLoading } = useOrders({ status: status || undefined, role: 'ADMIN', page: page - 1, size: 10 });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const handleStatusChange = (orderId: number, currentStatus: OrderStatus) => {
    const newStatus = NEXT_STATUS[currentStatus];
    if (!newStatus) return;
    updateStatus.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => success('订单状态已更新'),
        onError: () => error('更新失败'),
      }
    );
  };

  return (
    <DashboardLayout type="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">订单管理</h1>
        <Select
          value={status}
          onChange={(v) => { setStatus(v as OrderStatus | ''); setPage(1); }}
          className="w-40"
        >
          {ALL_STATUSES_FOR_ADMIN.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 animate-pulse">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            暂无订单数据
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">订单号: {order.orderNo}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold text-primary">{formatPrice(order.finalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Utensils className="h-3.5 w-3.5" />
                      {order.restaurantName || `餐厅 #${order.restaurantId}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      用户 #{order.userId}
                    </span>
                    {order.deliveryAddress && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.deliveryAddress.label} {order.deliveryAddress.detail}
                      </span>
                    )}
                  </div>

                  <div className="text-sm space-y-1 mb-3">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-muted-foreground">
                        {item.name} x{item.quantity} <span className="text-muted-foreground/70">{formatPrice(item.subtotal)}</span>
                      </p>
                    ))}
                    {order.remark && (
                      <p className="text-xs text-muted-foreground italic">备注: {order.remark}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2 flex-wrap">
                      {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && NEXT_STATUS[order.status] && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(order.id, order.status)}
                          disabled={updateStatus.isPending}
                        >
                          设为 {ORDER_STATUS_MAP[NEXT_STATUS[order.status]!]?.label}
                        </Button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/orders/${order.id}`}
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
