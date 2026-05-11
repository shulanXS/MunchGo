import { useState } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { userApi } from '@/api/user';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { User } from '@/types/user';
import { UserRole } from '@/types/enums';

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: '管理员',
  [UserRole.MERCHANT]: '商家',
  [UserRole.RIDER]: '骑手',
  [UserRole.CUSTOMER]: '顾客',
};

const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-700',
  [UserRole.MERCHANT]: 'bg-blue-100 text-blue-700',
  [UserRole.RIDER]: 'bg-green-100 text-green-700',
  [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-700',
};

export default function AdminUsersManagementPage() {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: () => userApi.getAllUsers({ page, size: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      success('用户已删除');
    },
    onError: () => error('删除失败'),
  });

  const filteredUsers = roleFilter
    ? (data?.content || []).filter((u: User) => u.role === roleFilter)
    : (data?.content || []);

  const totalPages = data?.totalPages || 0;

  return (
    <DashboardLayout type="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">用户管理</h1>
        <Select
          value={roleFilter}
          onChange={v => { setRoleFilter(v as UserRole || ''); setPage(0); }}
          placeholder="全部角色"
          className="w-40"
        >
          <option value="">全部角色</option>
          <option value={UserRole.ADMIN}>管理员</option>
          <option value={UserRole.MERCHANT}>商家</option>
          <option value={UserRole.RIDER}>骑手</option>
          <option value={UserRole.CUSTOMER}>顾客</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="暂无用户" />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user: User) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{user.username[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.username}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                    {user.role !== UserRole.ADMIN && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { if (confirm(`确认删除用户 ${user.username}?`)) deleteMutation.mutate(user.id); }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>下一页</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
