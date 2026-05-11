import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { AddressCard } from '@/components/common/AddressCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrder';
import { addressApi } from '@/api/address';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { success, error } = useToast();
  const { isAuthenticated } = useAuth();
  const [remark, setRemark] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAddresses(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr?.id) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [addresses, selectedAddressId]);

  const createOrder = useCreateOrder();

  const handleSubmit = () => {
    if (!selectedAddressId) {
      error('请选择收货地址');
      return;
    }
    if (!cart || cart.items.length === 0) {
      error('购物车是空的');
      return;
    }
    createOrder.mutate(
      { cartId: cart.id || 0, deliveryAddressId: selectedAddressId, remark },
      {
        onSuccess: (order) => {
          success('订单创建成功');
          navigate(`/orders/${order.id}`);
        },
        onError: () => {
          error('创建订单失败，请重试');
        },
      }
    );
  };

  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <EmptyState title="购物车是空的" description="请先添加商品" action={<Button onClick={() => navigate('/restaurants')}>去点餐</Button>} />
        </div>
      </MainLayout>
    );
  }

  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">确认订单</h1>

        <div className="space-y-6">
          {/* Address */}
          <div>
            <h2 className="font-semibold mb-3">收货地址</h2>
            {addresses && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selectable
                    selected={selectedAddressId === addr.id}
                    onSelect={setSelectedAddressId}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="暂无地址"
                description="请先添加收货地址"
                action={<Button onClick={() => navigate('/addresses')}>添加地址</Button>}
              />
            )}
          </div>

          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <CardTitle>订单详情</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.restaurantName && <p className="text-sm font-medium text-primary mb-3">{cart.restaurantName}</p>}
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id || item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.menuItemName} x{item.quantity}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Remark */}
          <Card>
            <CardContent className="p-4">
              <label className="text-sm font-medium mb-2 block">备注</label>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="有什么特殊需求？如：少辣、餐具等"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品总额</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">配送费</span>
                  <span>{formatPrice(cart.deliveryFee ?? 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                  <span>合计</span>
                  <span className="text-primary">{formatPrice((cart.totalAmount ?? 0) + (cart.deliveryFee ?? 0))}</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={!selectedAddressId || createOrder.isPending}>
                {createOrder.isPending ? '提交中...' : '提交订单'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
