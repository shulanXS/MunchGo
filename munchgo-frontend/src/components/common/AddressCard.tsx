import { MapPin, Check, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Address } from '@/types/address';
import { cn } from '@/lib/utils';

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: number) => void;
  onSetDefault?: (id: number) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (address: Address) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault, selectable, selected, onSelect }: AddressCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        selectable && selected && 'ring-2 ring-primary',
        selectable && !selected && 'hover:border-primary/50'
      )}
      onClick={() => selectable && onSelect?.(address)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{address.label}</span>
              {address.isDefault && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">默认</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{address.detail}</p>
          </div>
          {selectable && selected && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
        </div>
        {!selectable && (onEdit || onDelete || onSetDefault) && (
          <div className="mt-3 flex items-center gap-2 pt-3 border-t">
            {onSetDefault && !address.isDefault && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSetDefault(address.id)}>
                设为默认
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onEdit(address)}>
                <Edit2 className="h-3 w-3 mr-1" />编辑
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(address.id)}>
                <Trash2 className="h-3 w-3 mr-1" />删除
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
