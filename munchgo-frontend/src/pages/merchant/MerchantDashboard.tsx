import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { restaurantApi } from '@/api/restaurant';

interface Stats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  avgRating: number;
  loading: boolean;
}

export default function MerchantDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, todayOrders: 0, totalRevenue: 0, avgRating: 0, loading: true });

  useEffect(() => {
    restaurantApi.getMyRestaurants()
      .then(async (restaurants) => {
        if (restaurants.length === 0) {
          setStats({ totalOrders: 0, todayOrders: 0, totalRevenue: 0, avgRating: 0, loading: false });
          return;
        }

        let totalOrders = 0;
        let todayOrders = 0;
        let totalRevenue = 0;
        let totalRating = 0;
        let ratingCount = 0;

        for (const r of restaurants) {
          try {
            const s = await restaurantApi.getStats(r.id);
            totalOrders += s.totalOrders;
            todayOrders += s.todayOrders;
            totalRevenue += s.totalRevenue;
            if (s.avgRating > 0) { totalRating += s.avgRating; ratingCount++; }
          } catch { /* skip failed stats */ }
        }

        setStats({
          totalOrders,
          todayOrders,
          totalRevenue,
          avgRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
          loading: false,
        });
      })
      .catch(() => { setStats(s => ({ ...s, loading: false })); });
  }, []);

  const formatPrice = (n: number) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <DashboardLayout type="merchant">
      <h1 className="text-xl font-bold mb-6">商家概览</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="今日订单"
          value={stats.loading ? '—' : String(stats.todayOrders)}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
          loading={stats.loading}
        />
        <StatCard
          label="今日收入"
          value={stats.loading ? '—' : `¥${formatPrice(stats.totalRevenue)}`}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
          loading={stats.loading}
        />
        <StatCard
          label="总订单数"
          value={stats.loading ? '—' : String(stats.totalOrders)}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          color="bg-purple-50"
          loading={stats.loading}
        />
        <StatCard
          label="平均评分"
          value={stats.loading ? '—' : String(stats.avgRating)}
          icon={<Star className="h-5 w-5 text-yellow-600" />}
          color="bg-yellow-50"
          loading={stats.loading}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/merchant/restaurant')}>
            <CardContent className="p-4">
              <p className="font-medium">管理餐厅</p>
              <p className="text-sm text-muted-foreground">添加、编辑餐厅信息</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/merchant/menu')}>
            <CardContent className="p-4">
              <p className="font-medium">菜品管理</p>
              <p className="text-sm text-muted-foreground">添加、编辑菜单</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/merchant/orders')}>
            <CardContent className="p-4">
              <p className="font-medium">订单处理</p>
              <p className="text-sm text-muted-foreground">查看和处理订单</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color, loading }: { label: string; value: string; icon: React.ReactNode; color: string; loading: boolean }) {
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
