import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
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
      onSuccess: () => navigate('/home'),
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
