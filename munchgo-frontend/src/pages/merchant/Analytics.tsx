import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { restaurantApi } from '@/api/restaurant';
import { orderApi } from '@/api/order';
import { useMerchantStore } from '@/stores/merchantStore';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  avgRating: number;
  loading: boolean;
}

export default function MerchantAnalyticsPage() {
  const { currentRestaurantId, setCurrentRestaurant } = useMerchantStore();
  const [restaurantList, setRestaurantList] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, todayOrders: 0, totalRevenue: 0, avgRating: 0, loading: true });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    restaurantApi.getMyRestaurants()
      .then(restaurants => {
        setRestaurantList(restaurants);
        if (restaurants.length > 0 && !currentRestaurantId) {
          setCurrentRestaurant(restaurants[0].id);
        }
      })
      .catch(() => { setStats(s => ({ ...s, loading: false })); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentRestaurantId || restaurantList.length === 0) return;
    const r = restaurantList.find(r => r.id === currentRestaurantId) || restaurantList[0];
    if (!r) return;

    setStats(s => ({ ...s, loading: true }));
    restaurantApi.getStats(r.id)
      .then(s => {
        setStats({
          totalOrders: s.totalOrders,
          todayOrders: s.todayOrders,
          totalRevenue: s.totalRevenue,
          avgRating: s.avgRating || 0,
          loading: false,
        });
      })
      .catch(() => { setStats(s => ({ ...s, loading: false })); });

    setOrdersLoading(true);
    orderApi.getRecentOrders(50)
      .then(orders => {
        const mine = orders.filter((o: any) => o.restaurantId === currentRestaurantId);
        setRecentOrders(mine);
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [currentRestaurantId, restaurantList]);

  const completedOrders = recentOrders.filter((o: any) => o.status === 'COMPLETED');
  const cancelledOrders = recentOrders.filter((o: any) => o.status === 'CANCELLED');
  const avgOrderValue = completedOrders.length > 0
    ? completedOrders.reduce((sum: number, o: any) => sum + (o.finalAmount || 0), 0) / completedOrders.length
    : 0;

  const currentRestaurant = restaurantList.find(r => r.id === currentRestaurantId) || restaurantList[0];

  return (
    <DashboardLayout type="merchant">
      <h1 className="text-xl font-bold mb-6">数据分析</h1>

      {restaurantList.length > 1 && (
        <div className="mb-6">
          <label className="text-sm font-medium mb-1 block">选择餐厅</label>
          <Select
            value={String(currentRestaurantId || '')}
            onChange={v => setCurrentRestaurant(Number(v))}
            className="w-64"
          >
            {restaurantList.map(r => (
              <option key={r.id} value={String(r.id)}>{r.name}</option>
            ))}
          </Select>
        </div>
      )}

      {restaurantList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            暂无餐厅数据
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="今日订单"
              value={stats.loading ? null : String(stats.todayOrders)}
              icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
              color="bg-blue-50"
              loading={stats.loading}
            />
            <StatCard
              label="今日收入"
              value={stats.loading ? null : formatPrice(stats.totalRevenue)}
              icon={<DollarSign className="h-5 w-5 text-green-600" />}
              color="bg-green-50"
              loading={stats.loading}
            />
            <StatCard
              label="总订单数"
              value={stats.loading ? null : String(stats.totalOrders)}
              icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              color="bg-purple-50"
              loading={stats.loading}
            />
            <StatCard
              label="平均评分"
              value={stats.loading ? null : String(stats.avgRating.toFixed(1))}
              icon={<Star className="h-5 w-5 text-yellow-600" />}
              color="bg-yellow-50"
              loading={stats.loading}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">已完成订单</p>
                {ordersLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">已取消订单</p>
                {ordersLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">{cancelledOrders.length}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">平均订单金额</p>
                {ordersLoading ? (
                  <Skeleton className="h-8 w-24" />
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
                <h2 className="font-semibold">
                  {currentRestaurant?.name} — 最近订单
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">订单号</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">金额</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        </tr>
                      ))
                    ) : recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          暂无订单数据
                        </td>
                      </tr>
                    ) : (
                      recentOrders.slice(0, 20).map((order: any) => (
                        <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{order.orderNo}</td>
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
        </>
      )}
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
