import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: '顾客', description: '浏览餐厅、下单订餐' },
  { value: 'MERCHANT', label: '商家', description: '管理餐厅和菜单' },
  { value: 'RIDER', label: '骑手', description: '负责配送订单' },
] as const;

function getRedirectPath(role: string | undefined): string {
  if (role === 'MERCHANT') return '/merchant';
  if (role === 'RIDER') return '/rider';
  if (role === 'ADMIN') return '/admin';
  return '/home';
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', phone: '', role: 'CUSTOMER' as 'CUSTOMER' | 'MERCHANT' | 'RIDER',
  });
  const { register, isRegistering } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      error('请填写必填项');
      return;
    }
    if (form.password.length < 6) {
      error('密码至少6位');
      return;
    }
    register(form, {
      onSuccess: () => {
        const role = useAuthStore.getState().user?.role;
        navigate(getRedirectPath(role));
      },
      onError: (err) => error(err.message || '注册失败'),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">创建账户</CardTitle>
          <CardDescription>加入 MunchGo 开始美食之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">用户名 *</label>
              <Input value={form.username} onChange={handleChange('username')} placeholder="用户名" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">邮箱 *</label>
              <Input type="email" value={form.email} onChange={handleChange('email')} placeholder="邮箱" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">密码 *</label>
              <Input type="password" value={form.password} onChange={handleChange('password')} placeholder="至少6位" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">手机号</label>
              <Input value={form.phone} onChange={handleChange('phone')} placeholder="可选" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">注册身份</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.role === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={() => setForm((prev) => ({ ...prev, role: opt.value }))}
                      className="sr-only"
                    />
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        form.role === opt.value ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {form.role === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? '注册中...' : '注册'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            已有账户？{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
