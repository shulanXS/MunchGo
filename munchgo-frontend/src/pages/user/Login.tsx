import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

function getRedirectPath(role: string | undefined): string {
  if (role === 'MERCHANT') return '/merchant';
  if (role === 'RIDER') return '/rider';
  if (role === 'ADMIN') return '/admin';
  return '/home';
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      error('请填写用户名和密码');
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
      const role = useAuthStore.getState().user?.role;
      navigate(getRedirectPath(role));
    } catch (err: any) {
      error(err?.response?.data?.message || err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">欢迎回来</CardTitle>
          <CardDescription>登录到 MunchGo 账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">用户名</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            还没有账户？{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </p>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              商家、骑手、管理员请使用专门账号登录
            </p>
            <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
              <span>商家后台 <Link to="/register" className="text-primary hover:underline">注册</Link></span>
              <span>骑手后台 <Link to="/register" className="text-primary hover:underline">注册</Link></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
