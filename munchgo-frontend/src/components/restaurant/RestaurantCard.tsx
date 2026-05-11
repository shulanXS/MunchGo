import * as React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Restaurant } from '@/types/restaurant';
import { RESTAURANT_STATUS_MAP } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

export function RestaurantCard({ restaurant, className }: RestaurantCardProps) {
  const statusInfo = RESTAURANT_STATUS_MAP[restaurant.status] || RESTAURANT_STATUS_MAP.CLOSED;

  return (
    <Link to={`/restaurants/${restaurant.id}`}>
      <Card
        className={cn(
          'overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
          className
        )}
      >
        <div className="relative h-40 bg-gradient-to-br from-orange-100 to-orange-50">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl">🍜</span>
            </div>
          )}
          <Badge
            className={cn('absolute top-2 right-2', statusInfo.color)}
          >
            {statusInfo.label}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg truncate max-w-[180px]">{restaurant.name}</h3>
              {restaurant.cuisineType && (
                <p className="text-sm text-muted-foreground">{restaurant.cuisineType}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({restaurant.reviewCount})</span>
            </div>
          </div>
          {restaurant.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between text-sm">
            {restaurant.address && (
              <span className="flex items-center gap-1 text-muted-foreground truncate max-w-[200px]">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {restaurant.address}
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <span className="text-primary font-medium">
                {formatPrice(restaurant.minOrderAmount)}起
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                {formatPrice(restaurant.deliveryFee)}配送
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
