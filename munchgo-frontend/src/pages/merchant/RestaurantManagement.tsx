import { useState } from 'react';
import { Plus, Pencil, Trash2, Utensils } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { restaurantApi } from '@/api/restaurant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { Restaurant } from '@/types/restaurant';
import { RestaurantStatus } from '@/types/enums';

const emptyForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  cuisineType: '',
  imageUrl: '',
  minOrderAmount: '',
  deliveryFee: '',
};

export default function MerchantRestaurantManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['merchant-restaurants'],
    queryFn: () => restaurantApi.getMyRestaurants(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => restaurantApi.createRestaurant({
      name: data.name,
      description: data.description || undefined,
      address: data.address,
      phone: data.phone || undefined,
      cuisineType: data.cuisineType || undefined,
      imageUrl: data.imageUrl || undefined,
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      deliveryFee: data.deliveryFee ? Number(data.deliveryFee) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
      success('餐厅创建成功');
      closeDialog();
    },
    onError: () => error('创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) => restaurantApi.updateRestaurant(id, {
      name: data.name,
      description: data.description || undefined,
      address: data.address,
      phone: data.phone || undefined,
      cuisineType: data.cuisineType || undefined,
      imageUrl: data.imageUrl || undefined,
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      deliveryFee: data.deliveryFee ? Number(data.deliveryFee) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
      success('餐厅更新成功');
      closeDialog();
    },
    onError: () => error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => restaurantApi.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
      success('餐厅已删除');
    },
    onError: () => error('删除失败'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: RestaurantStatus }) =>
      restaurantApi.updateRestaurantStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
      success('状态已更新');
    },
    onError: () => error('更新失败'),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const openEdit = (r: Restaurant) => {
    setEditId(r.id);
    setForm({
      name: r.name,
      description: r.description || '',
      address: r.address || '',
      phone: r.phone || '',
      cuisineType: r.cuisineType || '',
      imageUrl: r.imageUrl || '',
      minOrderAmount: String(r.minOrderAmount),
      deliveryFee: String(r.deliveryFee),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.address.trim()) { error('请填写必填项'); return; }
    if (editId) {
      updateMutation.mutate({ id: editId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <DashboardLayout type="merchant">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">餐厅管理</h1>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> 添加餐厅
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <Card key={i}><CardContent className="p-6"><div className="h-24 animate-pulse bg-muted rounded" /></CardContent></Card>)}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={<Utensils className="h-10 w-10" />}
          title="暂无餐厅"
          description="点击上方按钮添加您的第一个餐厅"
          action={<Button onClick={() => { setForm(emptyForm); setEditId(null); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" /> 添加餐厅</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{r.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status === 'OPEN' ? '营业中' : '已关闭'}
                      </span>
                    </div>
                    {r.cuisineType && <p className="text-sm text-muted-foreground mb-1">{r.cuisineType}</p>}
                    {r.address && <p className="text-sm text-muted-foreground truncate">{r.address}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>起送 ¥{r.minOrderAmount}</span>
                      <span>配送 ¥{r.deliveryFee}</span>
                      <span>评分 {r.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: r.id, status: r.status === 'OPEN' ? 'CLOSED' : 'OPEN' })}
                      disabled={statusMutation.isPending}
                    >
                      {r.status === 'OPEN' ? '关闭' : '营业'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('确认删除?')) deleteMutation.mutate(r.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogHeader>
          <DialogTitle>{editId ? '编辑餐厅' : '添加餐厅'}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">餐厅名称 *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="如：湘味小厨" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">地址 *</label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="详细地址" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">电话</label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="010-xxxxxxx" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">菜系</label>
                <Input value={form.cuisineType} onChange={e => setForm(f => ({ ...f, cuisineType: e.target.value }))} placeholder="如：川菜" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">起送价 (元)</label>
                <Input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="20" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">配送费 (元)</label>
                <Input type="number" value={form.deliveryFee} onChange={e => setForm(f => ({ ...f, deliveryFee: e.target.value }))} placeholder="5" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">图片 URL</label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">简介</label>
              <textarea
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="餐厅简介"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>取消</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {editId ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </Dialog>
    </DashboardLayout>
  );
}
