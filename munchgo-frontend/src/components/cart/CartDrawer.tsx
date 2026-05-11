import * as React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, cart } = useCartStore();
  const { updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={closeDrawer} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="font-semibold">购物车</h2>
            {cart && cart.items.length > 0 && (
              <span className="text-sm text-muted-foreground">({cart.items.reduce((s, i) => s + i.quantity, 0)})</span>
            )}
          </div>
          <button onClick={closeDrawer} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">购物车是空的</p>
              <p className="text-sm text-muted-foreground mt-1">快去添加一些美食吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.restaurantName && (
                <p className="text-sm font-medium text-primary">{cart.restaurantName}</p>
              )}
              {cart.items.map((item) => (
                <div key={item.id || item.menuItemId} className="flex gap-3">
                  <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {item.menuItemImage ? (
                      <img src={item.menuItemImage} alt={item.menuItemName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium truncate">{item.menuItemName}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          className="h-6 w-6 flex items-center justify-center rounded border hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center rounded border hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-medium text-primary">{formatPrice(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">配送费</span>
              <span className="font-medium">{formatPrice(cart.restaurantId ? 0 : 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">合计</span>
              <span className="text-xl font-bold text-primary">{formatPrice(cart.totalAmount)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              去结算
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
