'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const messages = [
  'Scanning the menu...',
  'Consulting our virtual food expert...',
  'Translating deliciousness...',
  'Finding the must-try dishes...',
];

export function ProcessingView() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
      <h2 className="text-2xl font-semibold text-foreground h-8">
        {messages[currentMessageIndex]}
      </h2>
      <p className="mt-2 text-muted-foreground">
        Please wait a moment while we work our magic...
      </p>
    </div>
  );
}
