import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { OrderStatus } from '@/types/enums';
import { ORDER_STATUS_MAP } from '@/lib/constants';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const info = ORDER_STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <Badge className={cn(info.color, className)}>
      {info.label}
    </Badge>
  );
}
