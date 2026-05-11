import { Card, CardContent } from '@/components/ui/Card';
import { StarRating } from './StarRating';
import { formatDateTime } from '@/lib/utils';
import { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.username} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-primary">
                {review.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{review.username || '匿名用户'}</p>
                <StarRating value={review.rating} readonly size="sm" />
              </div>
              <p className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>
            </div>
            {review.content && <p className="mt-2 text-sm">{review.content}</p>}
            {review.images && review.images.length > 0 && (
              <div className="mt-2 flex gap-2">
                {review.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            )}
            {review.reply && (
              <div className="mt-2 rounded-lg bg-muted p-2 text-sm">
                <p className="text-xs text-muted-foreground mb-1">商家回复</p>
                <p>{review.reply}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
