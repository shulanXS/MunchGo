import { cn } from '@/lib/utils';
import { Category } from '@/types/menu';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          selectedCategoryId === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            selectedCategoryId === cat.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {cat.name}
          {cat.menuItemCount !== undefined && (
            <span className="ml-1 text-xs opacity-70">({cat.menuItemCount})</span>
          )}
        </button>
      ))}
    </div>
  );
}
