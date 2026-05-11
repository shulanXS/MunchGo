import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Utensils, ShoppingBag, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { restaurantApi } from '@/api/restaurant';
import { userApi } from '@/api/user';
import { orderApi } from '@/api/order';

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  pendingOrders: number;
  loading: boolean;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalRestaurants: 0, totalOrders: 0, pendingOrders: 0, loading: true });

  useEffect(() => {
    Promise.all([
      userApi.getAllUsers({ page: 0, size: 1 }),
      restaurantApi.getRestaurants({ page: 0, size: 1 }),
    ])
      .then(([users, restaurants]) => {
        setStats(s => ({
          ...s,
          totalUsers: users.totalElements,
          totalRestaurants: restaurants.totalElements,
          loading: false,
        }));
      })
      .catch(() => setStats(s => ({ ...s, loading: false })));

    orderApi.getOrderStats()
      .then(data => {
        setStats(s => ({
          ...s,
          totalOrders: data.total,
          pendingOrders: data.pending,
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout type="admin">
      <h1 className="text-xl font-bold mb-6">系统概览</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={stats.loading ? '—' : String(stats.totalUsers)}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
          loading={stats.loading}
        />
        <StatCard
          label="总餐厅数"
          value={stats.loading ? '—' : String(stats.totalRestaurants)}
          icon={<Utensils className="h-5 w-5 text-orange-600" />}
          color="bg-orange-50"
          loading={stats.loading}
        />
        <StatCard
          label="总订单数"
          value={stats.loading ? '—' : String(stats.totalOrders)}
          icon={<ShoppingBag className="h-5 w-5 text-purple-600" />}
          color="bg-purple-50"
          loading={stats.loading}
        />
        <StatCard
          label="待处理订单"
          value={stats.loading ? '—' : String(stats.pendingOrders)}
          icon={<Clock className="h-5 w-5 text-red-600" />}
          color="bg-red-50"
          loading={stats.loading}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/users')}>
            <CardContent className="p-4">
              <p className="font-medium">用户管理</p>
              <p className="text-sm text-muted-foreground">查看和删除用户</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/restaurants')}>
            <CardContent className="p-4">
              <p className="font-medium">餐厅管理</p>
              <p className="text-sm text-muted-foreground">查看和删除餐厅</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/orders')}>
            <CardContent className="p-4">
              <p className="font-medium">订单管理</p>
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
