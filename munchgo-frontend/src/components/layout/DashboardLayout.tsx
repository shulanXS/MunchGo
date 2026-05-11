import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronLeft,
  Menu,
  LogOut,
  Bell,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ToastContainer } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

interface SidebarProps {
  items: NavItem[];
  isCollapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ items, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link to="/" className="text-xl font-bold text-primary">MunchGo</Link>
        )}
        <button onClick={onToggle} className="p-1 hover:bg-muted rounded">
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: 'merchant' | 'admin' | 'rider';
}

export function DashboardLayout({ children, type }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();

  const merchantNav: NavItem[] = [
    { label: '概览', icon: LayoutDashboard, href: `/${type}` },
    { label: '餐厅管理', icon: UtensilsCrossed, href: `/${type}/restaurant` },
    { label: '菜单管理', icon: Utensils, href: `/${type}/menu` },
    { label: '订单管理', icon: ShoppingBag, href: `/${type}/orders` },
    { label: '数据分析', icon: BarChart3, href: `/${type}/stats` },
  ];

  const adminNav: NavItem[] = [
    { label: '概览', icon: LayoutDashboard, href: `/${type}` },
    { label: '用户管理', icon: Users, href: `/${type}/users` },
    { label: '餐厅管理', icon: UtensilsCrossed, href: `/${type}/restaurants` },
    { label: '订单管理', icon: ShoppingBag, href: `/${type}/orders` },
    { label: '数据分析', icon: BarChart3, href: `/${type}/stats` },
  ];

  const riderNav: NavItem[] = [
    { label: '工作台', icon: LayoutDashboard, href: `/${type}` },
    { label: '接单池', icon: ShoppingBag, href: `/${type}/pool` },
    { label: '我的配送', icon: ShoppingCart, href: `/${type}/orders` },
    { label: '配送历史', icon: History, href: `/${type}/history` },
  ];

  const navItems = type === 'merchant' ? merchantNav : type === 'admin' ? adminNav : riderNav;

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar items={navItems} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-56'
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
          <div>
            <h1 className="text-lg font-semibold capitalize">
              {type === 'merchant' ? '商家' : type === 'admin' ? '管理' : '骑手'} 概览
            </h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount ? (
                <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              ) : null}
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      <ToastContainer />
    </div>
  );
}
