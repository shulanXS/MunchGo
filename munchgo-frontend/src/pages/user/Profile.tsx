import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userApi } from '@/api/user';

export default function ProfilePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [form, setForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateUser(user!.id, form);
      success('个人信息已更新');
    } catch {
      error('更新失败');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-6">个人中心</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.username}</p>
            <p className="text-sm text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">用户名</label>
                <Input value={user?.username || ''} disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">邮箱</label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">手机号</label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full">保存修改</Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
