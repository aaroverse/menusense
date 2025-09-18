import type { ClientMenuItem } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/menu-item-card';

interface ResultViewProps {
  items: ClientMenuItem[];
  onReset: () => void;
}

export function ResultView({ items, onReset }: ResultViewProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Here's Your Menu
        </h1>
        <Button onClick={onReset} variant="outline">
          Scan Another Menu
        </Button>
      </div>
      <div className="grid gap-4 md:gap-6">
        {items.map((item, index) => (
          <MenuItemCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
