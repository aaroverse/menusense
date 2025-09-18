'use client';

import { useState } from 'react';
import type { ActionResult } from '@/app/actions';
import { processMenuImage } from '@/app/actions';
import { ReadyView } from '@/components/views/ready-view';
import { ProcessingView } from '@/components/views/processing-view';
import { ErrorView } from '@/components/views/error-view';
import { ResultView } from '@/components/views/results-view';

type AppState = 'ready' | 'processing' | 'result' | 'error';

export default function HomePage() {
  const [state, setState] = useState<AppState>('ready');
  const [result, setResult] = useState<ActionResult>({});

  const handleFormAction = async (formData: FormData) => {
    setState('processing');
    const response = await processMenuImage(formData);

    if (response.error) {
      setResult({ error: response.error });
      setState('error');
    } else if (response.data && response.data.length > 0) {
      setResult({ data: response.data });
      setState('result');
    } else {
      setResult({
        error:
          "We couldn't find any dishes in that photo. Please ensure the menu text is visible.",
      });
      setState('error');
    }
  };

  const resetState = () => {
    setState('ready');
    setResult({});
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl animate-in fade-in-50 duration-500">
          {state === 'ready' && <ReadyView action={handleFormAction} />}
          {state === 'processing' && <ProcessingView />}
          {state === 'error' && (
            <ErrorView message={result.error!} onReset={resetState} />
          )}
          {state === 'result' && (
            <ResultView items={result.data!} onReset={resetState} />
          )}
        </div>
      </main>
      <footer className="w-full py-4 px-8 text-center">
        <p className="text-xs text-muted-foreground">
          Uploaded images are used only for processing and are not stored.
        </p>
      </footer>
    </div>
  );
}
