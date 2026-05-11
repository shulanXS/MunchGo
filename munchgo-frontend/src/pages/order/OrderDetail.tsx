import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useOrder, useCancelOrder } from '@/hooks/useOrder';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(id!);
  const cancelOrder = useCancelOrder();

  if (isLoading) return <MainLayout><PageLoading /></MainLayout>;
  if (!order) return <MainLayout><EmptyState title="订单不存在" /></MainLayout>;

  const canCancel = order.status === OrderStatus.PENDING && user?.id === order.userId;

  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    [OrderStatus.PENDING]: null,
    [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
    [OrderStatus.PREPARING]: OrderStatus.READY,
    [OrderStatus.READY]: OrderStatus.DELIVERING,
    [OrderStatus.DELIVERING]: OrderStatus.COMPLETED,
    [OrderStatus.COMPLETED]: null,
    [OrderStatus.CANCELLED]: null,
  };

  const statusLabel: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '待支付',
    [OrderStatus.CONFIRMED]: '已接单',
    [OrderStatus.PREPARING]: '制作中',
    [OrderStatus.READY]: '待配送',
    [OrderStatus.DELIVERING]: '配送中',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/orders')}>← 返回</Button>

        <div className="space-y-4">
          {/* Status */}
          <Card className="border-primary/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
              <p className="mt-2 text-muted-foreground text-sm">{statusLabel[order.status]}</p>
              <p className="text-xs text-muted-foreground mt-1">订单号: {order.orderNo}</p>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {order.deliveryAddress && (
            <Card>
              <CardHeader><CardTitle>配送信息</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{order.deliveryAddress.detail}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restaurant */}
          <Card>
            <CardHeader><CardTitle>{order.restaurantName || `餐厅 #${order.restaurantId}`}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品总额</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">配送费</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">优惠</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                  <span>实付金额</span>
                  <span className="text-primary">{formatPrice(order.finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remark */}
          {order.remark && (
            <Card>
              <CardContent className="p-4 text-sm">
                <p className="text-muted-foreground">备注</p>
                <p className="mt-1">{order.remark}</p>
              </CardContent>
            </Card>
          )}

          {/* Time */}
          <Card>
            <CardContent className="p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">下单时间</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支付时间</span>
                  <span>{formatDateTime(order.paidAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            {canCancel && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (confirm('确定要取消订单吗？')) {
                    cancelOrder.mutate(order.id);
                  }
                }}
              >
                取消订单
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/restaurants/${order.restaurantId}`)}>
              再来一单
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
