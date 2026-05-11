import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddressCard } from '@/components/common/AddressCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { addressApi } from '@/api/address';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { Address } from '@/types/address';

type AddressFormData = { label: string; detail: string; latitude?: number; longitude?: number };

export default function AddressListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressFormData>({ label: '', detail: '' });
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAddresses(),
  });

  const createMutation = useMutation({
    mutationFn: (data: AddressFormData) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      success('添加成功');
      setIsDialogOpen(false);
      setForm({ label: '', detail: '' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || '添加失败';
      error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressFormData }) => addressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      success('更新成功');
      setIsDialogOpen(false);
      setForm({ label: '', detail: '' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || '更新失败';
      error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      success('删除成功');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || '删除失败';
      error(msg);
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: number) => addressApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      success('已设为默认');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || '设置失败';
      error(msg);
    },
  });

  const openAdd = () => {
    setEditAddress(null);
    setForm({ label: '', detail: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditAddress(addr);
    setForm({ label: addr.label, detail: addr.detail });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.label.trim() || !form.detail.trim()) return;
    if (editAddress) {
      updateMutation.mutate({ id: editAddress.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const canSubmit = form.label.trim().length > 0 && form.detail.trim().length > 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">收货地址</h1>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> 添加
          </Button>
        </div>

        {isLoading ? null : addresses?.length === 0 ? (
          <EmptyState title="暂无地址" description="添加收货地址以便更快下单" />
        ) : (
          <div className="space-y-3">
            {addresses?.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={openEdit}
                onDelete={(id) => { if (confirm('确定删除？')) deleteMutation.mutate(id); }}
                onSetDefault={(id) => defaultMutation.mutate(id)}
              />
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editAddress ? '编辑地址' : '添加地址'}</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">地址名称</label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="如：家、公司"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">详细地址</label>
                <Input
                  value={form.detail}
                  onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))}
                  placeholder="街道、门牌号"
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}>
              保存
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </MainLayout>
  );
}
