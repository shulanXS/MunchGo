import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  className?: string;
}

export function MenuItemCard({ item, onAddToCart, className }: MenuItemCardProps) {
  return (
    <Card className={cn('overflow-hidden', !item.available && 'opacity-60', className)}>
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium">已售罄</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              {item.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              )}
              {item.tags && (
                <div className="mt-1 flex gap-1 flex-wrap">
                  {item.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 ml-2">
              <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
              <Button
                size="sm"
                className="h-7 px-2"
                onClick={() => item.available && onAddToCart(item)}
                disabled={!item.available}
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
