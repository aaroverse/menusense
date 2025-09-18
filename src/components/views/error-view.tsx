import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorViewProps {
  message: string;
  onReset: () => void;
}

export function ErrorView({ message, onReset }: ErrorViewProps) {
  return (
    <Card
      className="text-center border-destructive"
      role="alert"
    >
      <CardHeader>
        <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit">
            <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <CardTitle className="pt-4">Oh no!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onReset}>Try Again</Button>
      </CardContent>
    </Card>
  );
}
