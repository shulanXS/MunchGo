import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { OrderCard } from '@/components/order/OrderCard';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ShoppingBag } from 'lucide-react';
import { useOrders } from '@/hooks/useOrder';
import { OrderStatus } from '@/types/enums';

const statusOptions = [
  { value: '', label: '全部' },
  { value: OrderStatus.PENDING, label: '待支付' },
  { value: OrderStatus.CONFIRMED, label: '已接单' },
  { value: OrderStatus.PREPARING, label: '制作中' },
  { value: OrderStatus.DELIVERING, label: '配送中' },
  { value: OrderStatus.COMPLETED, label: '已完成' },
  { value: OrderStatus.CANCELLED, label: '已取消' },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrders({ status: status || undefined, page: page - 1, size: 10 });

  const orders = data?.content || [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">我的订单</h1>

        <div className="mb-4">
          <Select value={status} onChange={(v) => { setStatus(v as OrderStatus | ''); setPage(1); }}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-12 w-12" />}
            title="暂无订单"
            description="快去下单吧"
            action={<Button onClick={() => navigate('/restaurants')}>去点餐</Button>}
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {data && data.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                pageSize={10}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
