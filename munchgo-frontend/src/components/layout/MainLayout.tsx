import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, Bell, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { ToastContainer } from '@/components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">MunchGo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-sm font-medium hover:text-primary transition-colors">首页</Link>
            <Link to="/restaurants" className="text-sm font-medium hover:text-primary transition-colors">餐厅列表</Link>
            <Link to="/orders" className="text-sm font-medium hover:text-primary transition-colors">我的订单</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/restaurants" className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Heart className="h-5 w-5" />
                </Link>

                <Link to="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  {unreadCount ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </Link>

                <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-medium text-sm"
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                        <User className="inline h-4 w-4 mr-2" />
                        个人中心
                      </Link>
                      <Link to="/addresses" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                        地址管理
                      </Link>
                      {user?.role === 'MERCHANT' && (
                        <Link to="/merchant" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                          商家后台
                        </Link>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                          管理后台
                        </Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">
                        <LogOut className="inline h-4 w-4 mr-2" />
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">注册</Button>
                </Link>
              </>
            )}

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-2">
            <Link to="/home" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>首页</Link>
            <Link to="/restaurants" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>餐厅列表</Link>
            <Link to="/orders" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>我的订单</Link>
            {isAuthenticated && (
              <>
                <Link to="/cart" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  购物车 {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
                <Link to="/favorites" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>我的收藏</Link>
                <Link to="/profile" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>个人中心</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MunchGo - 在线订餐平台</p>
          <p className="mt-1">Copyright 2024 MunchGo. All rights reserved.</p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}
