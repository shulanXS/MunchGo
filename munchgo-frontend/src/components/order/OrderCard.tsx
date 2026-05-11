import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div>
          <p className="text-sm font-medium">{order.restaurantName || `餐厅 #${order.restaurantId}`}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="space-y-2">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t">
          <span className="text-lg font-bold text-primary">{formatPrice(order.finalAmount)}</span>
          <Link to={`/orders/${order.id}`}>
            <span className="text-sm text-primary hover:underline">查看详情 →</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
