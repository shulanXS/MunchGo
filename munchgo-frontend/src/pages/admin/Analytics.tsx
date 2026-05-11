import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { orderApi } from '@/api/order';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminOrderStats'],
    queryFn: () => orderApi.getOrderStats(),
  });

  const { data: recentOrders, isLoading: recentLoading } = useQuery({
    queryKey: ['adminRecentOrders'],
    queryFn: () => orderApi.getRecentOrders(20),
  });

  const totalRevenue = recentOrders
    ? recentOrders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (o.finalAmount || 0), 0)
    : 0;

  const completedOrders = recentOrders
    ? recentOrders.filter(o => o.status === 'COMPLETED').length
    : 0;

  const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  return (
    <DashboardLayout type="admin">
      <h1 className="text-xl font-bold mb-6">数据分析</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="总订单数"
          value={statsLoading ? null : String(stats?.total ?? 0)}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
          loading={statsLoading}
        />
        <StatCard
          label="待处理订单"
          value={statsLoading ? null : String(stats?.pending ?? 0)}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          color="bg-yellow-50"
          loading={statsLoading}
        />
        <StatCard
          label="已完成订单"
          value={statsLoading ? null : String(stats?.completed ?? 0)}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
          loading={statsLoading}
        />
        <StatCard
          label="已取消订单"
          value={statsLoading ? null : String(stats?.cancelled ?? 0)}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          color="bg-red-50"
          loading={statsLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">总收入（已完成订单）</p>
            {recentLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">平均订单金额</p>
            {recentLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold">{formatPrice(avgOrderValue)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">最近订单</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">订单号</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">餐厅</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">金额</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : !recentOrders || recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      暂无订单数据
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{order.orderNo}</td>
                      <td className="px-4 py-3">{order.restaurantName || `餐厅 #${order.restaurantId}`}</td>
                      <td className="px-4 py-3 font-medium text-primary">{formatPrice(order.finalAmount)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color, loading }: {
  label: string; value: string | null; icon: React.ReactNode; color: string; loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-bold">{value ?? '0'}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: '已接单', color: 'bg-blue-100 text-blue-800' },
    PREPARING: { label: '制作中', color: 'bg-purple-100 text-purple-800' },
    READY: { label: '待配送', color: 'bg-orange-100 text-orange-800' },
    DELIVERING: { label: '配送中', color: 'bg-indigo-100 text-indigo-800' },
    COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  };
  const info = map[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
