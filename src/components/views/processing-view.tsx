import { Loader2 } from 'lucide-react';

export function ProcessingView() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
      <h2 className="text-2xl font-semibold text-foreground">Analyzing Your Menu</h2>
      <p className="mt-2 text-muted-foreground">
        Please wait a moment while we work our magic...
      </p>
    </div>
  );
}
