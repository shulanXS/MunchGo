import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, DollarSign, MapPin, Navigation } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types/enums';
import { useUpdateOrderStatus } from '@/hooks/useOrder';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '@/api/order';

interface RiderStats {
  todayCount: number;
  completedCount: number;
  pendingCount: number;
  totalEarnings: number;
  loading: boolean;
}

export default function RiderDashboardPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const updateStatus = useUpdateOrderStatus();
  const [stats, setStats] = useState<RiderStats>({
    todayCount: 0, completedCount: 0, pendingCount: 0, totalEarnings: 0, loading: true,
  });
  const [readyCount, setReadyCount] = useState(0);
  const [deliveringCount, setDeliveringCount] = useState(0);

  useEffect(() => {
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await orderApi.getOrders({ role: 'RIDER', size: 100 });
      const allOrders = result.content || [];
      const todayOrders = allOrders.filter((o: any) => o.createdAt?.startsWith(today));
      const completed = allOrders.filter((o: any) => o.status === OrderStatus.COMPLETED);
      const ready = allOrders.filter((o: any) => o.status === OrderStatus.READY);
      const delivering = allOrders.filter((o: any) => o.status === OrderStatus.DELIVERING);
      setReadyCount(ready.length);
      setDeliveringCount(delivering.length);
      setStats({
        todayCount: todayOrders.length,
        completedCount: completed.length,
        pendingCount: ready.length,
        totalEarnings: completed.reduce((sum: number, o: any) => sum + (o.deliveryFee || 0), 0),
        loading: false,
      });
    } catch {
      setStats(s => ({ ...s, loading: false }));
    }
  };

  const handleAccept = (orderId: number) => {
    updateStatus.mutate(
      { id: orderId, status: OrderStatus.DELIVERING },
      { onSuccess: () => { success('已接单，开始配送'); loadStats(); }, onError: () => error('接单失败') }
    );
  };

  const handleComplete = (orderId: number) => {
    updateStatus.mutate(
      { id: orderId, status: OrderStatus.COMPLETED },
      { onSuccess: () => { success('配送完成'); loadStats(); }, onError: () => error('操作失败') }
    );
  };

  return (
    <DashboardLayout type="rider">
      <h1 className="text-xl font-bold mb-6">骑手工作台</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="今日配送" value={stats.loading ? '—' : String(stats.todayCount)} icon={<Package className="h-5 w-5 text-blue-600" />} color="bg-blue-50" loading={stats.loading} />
        <StatCard label="待取货" value={stats.loading ? '—' : String(stats.pendingCount)} icon={<Clock className="h-5 w-5 text-orange-600" />} color="bg-orange-50" loading={stats.loading} />
        <StatCard label="累计完成" value={stats.loading ? '—' : String(stats.completedCount)} icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} color="bg-green-50" loading={stats.loading} />
        <StatCard label="配送收入" value={stats.loading ? '—' : formatPrice(stats.totalEarnings)} icon={<DollarSign className="h-5 w-5 text-purple-600" />} color="bg-purple-50" loading={stats.loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              待取货 ({readyCount})
            </h2>
            <Button size="sm" variant="outline" onClick={() => navigate('/rider/pool')}>
              查看全部
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                点击上方「接单池」查看并接取配送任务
              </p>
              <div className="flex justify-center">
                <Button size="sm" onClick={() => navigate('/rider/pool')}>
                  进入接单池
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-600" />
              配送中 ({deliveringCount})
            </h2>
            <Button size="sm" variant="outline" onClick={() => navigate('/rider/orders')}>
              查看全部
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                点击上方「我的配送」查看配送中和已完成订单
              </p>
              <div className="flex justify-center">
                <Button size="sm" onClick={() => navigate('/rider/orders')}>
                  查看我的配送
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color, loading }: {
  label: string; value: string; icon: React.ReactNode; color: string; loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  );
}
