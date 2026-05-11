import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useOrders } from '@/hooks/useOrder';
import { useUpdateOrderStatus } from '@/hooks/useOrder';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';
import { useToast } from '@/hooks/useToast';

export default function MerchantOrderManagementPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const { success, error } = useToast();

  const { data, isLoading } = useOrders({ status: status || undefined, role: 'MERCHANT', page: page - 1, size: 10 });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.content || [];

  const statusActions: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.PENDING]: '接单',
    [OrderStatus.CONFIRMED]: '开始制作',
    [OrderStatus.PREPARING]: '制作完成',
  };

  const handleAction = (orderId: number, currentStatus: OrderStatus) => {
    const actions = {
      [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
      [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
      [OrderStatus.PREPARING]: OrderStatus.READY,
    };
    const newStatus = actions[currentStatus];
    if (!newStatus) return;
    updateStatus.mutate(
      { id: orderId, status: newStatus },
      { onSuccess: () => success('状态已更新'), onError: () => error('更新失败') }
    );
  };

  return (
    <DashboardLayout type="merchant">
      <h1 className="text-xl font-bold mb-4">订单管理</h1>
      <div className="mb-4">
        <Select value={status} onChange={(v) => { setStatus(v as OrderStatus | ''); setPage(1); }}>
          <option value="">全部状态</option>
          <option value={OrderStatus.PENDING}>待接单</option>
          <option value={OrderStatus.CONFIRMED}>已接单</option>
          <option value={OrderStatus.PREPARING}>制作中</option>
          <option value={OrderStatus.READY}>待配送</option>
          <option value={OrderStatus.DELIVERING}>配送中</option>
          <option value={OrderStatus.COMPLETED}>已完成</option>
        </Select>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">订单号: {order.orderNo}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-sm space-y-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-muted-foreground">{item.name} x{item.quantity}</p>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="font-semibold text-primary">{formatPrice(order.finalAmount)}</span>
                {statusActions[order.status] && (
                  <Button size="sm" onClick={() => handleAction(order.id, order.status)}>
                    {statusActions[order.status]}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
