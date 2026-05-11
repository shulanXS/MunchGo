import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function LoadingOverlay({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <LoadingSpinner className="h-10 w-10" />
    </div>
  );
}
