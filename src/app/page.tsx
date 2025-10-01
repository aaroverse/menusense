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
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
  };

  const handleFormSubmit = async () => {
    if (!file) return;

    setState('processing');

    try {
      let fileToProcess = file;
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

      if (isHeic) {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        fileToProcess = new File([finalBlob], "converted.jpeg", { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('menuImage', fileToProcess);

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
    } catch (e) {
      console.error('Error during file conversion or processing:', e);
      setResult({ error: 'There was a problem processing your image. Please try a different one.' });
      setState('error');
    }
  };

  const resetState = () => {
    setState('ready');
    setResult({});
    setFile(null);
  };

  const renderContent = () => {
    switch (state) {
      case 'ready':
        return (
          <ReadyView
            onSubmit={handleFormSubmit}
            onFileChange={handleFileChange}
            file={file}
          />
        );
      case 'processing':
        return <ProcessingView />;
      case 'result':
        return <ResultView items={result.data!} onReset={resetState} />;
      case 'error':
        return <ErrorView message={result.error!} onReset={resetState} />;
      default:
        return (
          <ReadyView
            onSubmit={handleFormSubmit}
            onFileChange={handleFileChange}
            file={file}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl animate-in fade-in-50 duration-500">
          {renderContent()}
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
