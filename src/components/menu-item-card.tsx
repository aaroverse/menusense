import { Star } from 'lucide-react';
import type { ClientMenuItem } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: ClientMenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <Card
      className={cn(
        'transition-all',
        item.isRecommended && 'border-accent shadow-lg shadow-accent/10'
      )}
    >
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl text-foreground">
                    {item.translatedName}
                </CardTitle>
                <CardDescription>{item.originalName}</CardDescription>
            </div>
            {item.isRecommended && (
                <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 w-fit">
                    <Star className="w-4 h-4 mr-2 fill-current" />
                    Must-Try!
                </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  );
}
