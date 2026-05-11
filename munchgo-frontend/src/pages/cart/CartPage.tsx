import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

const getItemName = (item: { name?: string; menuItemName?: string }) => item.name ?? item.menuItemName ?? '未知菜品';
const getItemImage = (item: { imageUrl?: string; menuItemImage?: string }) => item.imageUrl ?? item.menuItemImage;

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <EmptyState
            icon={<ShoppingBag className="h-16 w-16" />}
            title="购物车是空的"
            description="快去添加一些美食吧"
            action={<Button onClick={() => navigate('/restaurants')}>去逛逛</Button>}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">购物车</h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1" /> 清空
          </Button>
        </div>

        {cart.restaurantName && (
          <Card className="mb-4 border-primary/50">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-primary">{cart.restaurantName}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {cart.items.map((item) => {
            const name = getItemName(item);
            const image = getItemImage(item);
            return (
              <Card key={item.id || item.menuItemId}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {image ? (
                        <img src={image} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{name}</h3>
                        <button onClick={() => removeItem(item.id || item.menuItemId, item.menuItemId)} className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-primary mt-1">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 border rounded-lg">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1, item.menuItemId)}
                            className="p-1.5 hover:bg-muted rounded-l-lg"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1, item.menuItemId)}
                            className="p-1.5 hover:bg-muted rounded-r-lg"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-primary">{formatPrice(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">商品总额</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>合计</span>
                <span className="text-primary">{formatPrice(cart.totalAmount)}</span>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={() => navigate('/checkout')}>
              去结算
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
