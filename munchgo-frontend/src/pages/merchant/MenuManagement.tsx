import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Utensils, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { restaurantApi } from '@/api/restaurant';
import { menuItemApi } from '@/api/menuItem';
import { MenuItem, Category } from '@/types/menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useMerchantStore } from '@/stores/merchantStore';
import { useNavigate } from 'react-router-dom';

const emptyItemForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  tags: '',
  available: true,
};

export default function MerchantMenuManagementPage() {
  const navigate = useNavigate();
  const { currentRestaurantId, setCurrentRestaurant } = useMerchantStore();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [categoryName, setCategoryName] = useState('');
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({
    queryKey: ['merchant-restaurants'],
    queryFn: () => restaurantApi.getMyRestaurants(),
  });

  const activeRestaurantId = selectedRestaurantId || currentRestaurantId;

  useEffect(() => {
    if (restaurants.length > 0 && !currentRestaurantId && !selectedRestaurantId) {
      setCurrentRestaurant(restaurants[0].id);
    }
  }, [restaurants, currentRestaurantId, selectedRestaurantId, setCurrentRestaurant]);

  const { data: categories = [] } = useQuery({
    queryKey: ['merchant-categories', activeRestaurantId],
    queryFn: () => restaurantApi.getCategories(activeRestaurantId!),
    enabled: !!activeRestaurantId,
  });

  const { data: menuItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['merchant-menu', activeRestaurantId],
    queryFn: () => restaurantApi.getMenu(activeRestaurantId!),
    enabled: !!activeRestaurantId,
  });

  const createItemMutation = useMutation({
    mutationFn: (data: typeof emptyItemForm) => menuItemApi.createMenuItem(activeRestaurantId!, {
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      imageUrl: data.imageUrl || undefined,
      tags: data.tags || undefined,
      available: data.available,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      success('菜品添加成功');
      closeItemDialog();
    },
    onError: () => error('添加失败'),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyItemForm }) => menuItemApi.updateMenuItem(id, {
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      imageUrl: data.imageUrl || undefined,
      tags: data.tags || undefined,
      available: data.available,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      success('菜品更新成功');
      closeItemDialog();
    },
    onError: () => error('更新失败'),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => menuItemApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      success('菜品已删除');
    },
    onError: () => error('删除失败'),
  });

  const toggleAvailableMutation = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      menuItemApi.updateMenuItemStatus(id, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => menuItemApi.createCategory(activeRestaurantId!, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
      success('分类添加成功');
      setCategoryName('');
      setIsCategoryDialogOpen(false);
    },
    onError: () => error('添加失败'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => menuItemApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      success('分类已删除');
    },
    onError: () => error('删除失败'),
  });

  const closeItemDialog = () => {
    setIsItemDialogOpen(false);
    setEditItem(null);
    setItemForm(emptyItemForm);
  };

  const openEditItem = (item: MenuItem) => {
    setEditItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      categoryId: String(item.categoryId || ''),
      imageUrl: item.imageUrl || '',
      tags: item.tags || '',
      available: item.available,
    });
    setIsItemDialogOpen(true);
  };

  const handleSubmitItem = () => {
    if (!itemForm.name.trim() || !itemForm.price) { error('请填写必填项'); return; }
    if (editItem) {
      updateItemMutation.mutate({ id: editItem.id, data: itemForm });
    } else {
      createItemMutation.mutate(itemForm);
    }
  };

  const formatPrice = (p: number) => p.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const groupedItems = menuItems.reduce((acc, item) => {
    const key = item.categoryName || '未分类';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <DashboardLayout type="merchant">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">菜单管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsCategoryDialogOpen(true)} disabled={!activeRestaurantId}>
            添加分类
          </Button>
          <Button onClick={() => { setItemForm(emptyItemForm); setEditItem(null); setIsItemDialogOpen(true); }} disabled={!activeRestaurantId}>
            <Plus className="h-4 w-4 mr-1" /> 添加菜品
          </Button>
        </div>
      </div>

      {loadingRestaurants ? (
        <Skeleton className="h-10 w-64 mb-6" />
      ) : restaurants.length === 0 ? (
        <EmptyState icon={<Utensils className="h-10 w-10" />} title="请先添加餐厅" description="在餐厅管理中添加餐厅后再来管理菜单" action={<Button onClick={() => navigate('/merchant/restaurant')}><Plus className="h-4 w-4 mr-1" /> 添加餐厅</Button>} />
      ) : (
        <>
          <div className="mb-6">
            <label className="text-sm font-medium mb-1 block">当前餐厅</label>
            <Select
              value={String(activeRestaurantId || '')}
              onChange={(v) => {
                const id = Number(v);
                setSelectedRestaurantId(id);
                setCurrentRestaurant(id);
              }}
              className="w-64"
            >
              {restaurants.map(r => (
                <option key={r.id} value={String(r.id)}>{r.name}</option>
              ))}
            </Select>
          </div>

          {selectedRestaurantId && (
            <>
              {categories.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      <span>{c.name}</span>
                      <button onClick={() => { if (confirm('删除分类?')) deleteCategoryMutation.mutate(c.id); }} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                    </div>
                  ))}
                </div>
              )}

              {loadingItems ? (
                <Skeleton className="h-32" />
              ) : menuItems.length === 0 ? (
                <EmptyState icon={<Utensils className="h-10 w-10" />} title="暂无菜品" description="点击添加菜品开始管理" action={<Button onClick={() => { setItemForm(emptyItemForm); setEditItem(null); setIsItemDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" /> 添加菜品</Button>} />
              ) : (
                Object.entries(groupedItems).map(([categoryName, items]) => (
                  <div key={categoryName} className="mb-8">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">{categoryName}</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <Card key={item.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium truncate">{item.name}</h4>
                                  {!item.available && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">已下架</span>}
                                </div>
                                {item.description && <p className="text-sm text-muted-foreground truncate">{item.description}</p>}
                                {item.tags && <p className="text-xs text-muted-foreground mt-1">{item.tags}</p>}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-semibold text-primary">¥{formatPrice(item.price)}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleAvailableMutation.mutate({ id: item.id, available: !item.available })}
                                >
                                  {item.available ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditItem(item)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { if (confirm('删除菜品?')) deleteItemMutation.mutate(item.id); }}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}

      <Dialog open={isItemDialogOpen} onClose={closeItemDialog}>
        <DialogHeader>
          <DialogTitle>{editItem ? '编辑菜品' : '添加菜品'}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">菜品名称 *</label>
              <Input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="如：红烧肉" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">价格 (元) *</label>
                <Input type="number" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} placeholder="28.00" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">分类</label>
                <Select value={itemForm.categoryId} onChange={v => setItemForm(f => ({ ...f, categoryId: v }))} placeholder="选择分类">
                  {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">图片 URL</label>
              <Input value={itemForm.imageUrl} onChange={e => setItemForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">标签</label>
              <Input value={itemForm.tags} onChange={e => setItemForm(f => ({ ...f, tags: e.target.value }))} placeholder="招牌,辣 (逗号分隔)" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">简介</label>
              <textarea
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                value={itemForm.description}
                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                placeholder="菜品简介"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={closeItemDialog}>取消</Button>
          <Button onClick={handleSubmitItem} disabled={createItemMutation.isPending || updateItemMutation.isPending}>
            {editItem ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onClose={() => { setIsCategoryDialogOpen(false); setCategoryName(''); }}>
        <DialogHeader>
          <DialogTitle>添加分类</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="分类名称，如：招牌菜" />
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); setCategoryName(''); }}>取消</Button>
          <Button onClick={() => { if (categoryName.trim()) createCategoryMutation.mutate(categoryName.trim()); }} disabled={createCategoryMutation.isPending}>添加</Button>
        </DialogFooter>
      </Dialog>
    </DashboardLayout>
  );
}
