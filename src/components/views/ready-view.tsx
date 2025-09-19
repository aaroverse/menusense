'use client';

import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';

function SubmitButton({ file }: { file: File | null }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full mt-4"
      disabled={!file || pending}
    >
      {pending ? 'Analyzing...' : 'Decode Menu'}
    </Button>
  );
}

export function ReadyView({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Logo className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          MenuSense
        </h1>
      </div>
      <p className="max-w-md mx-auto mb-8 text-muted-foreground">
        Snap a photo of any menu to get instant translations and dish
        descriptions.
      </p>
      <form action={action} className="space-y-4">
        <label
          htmlFor="menu-upload"
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors',
            { 'border-primary': file }
          )}
        >
          {file ? (
            <div className="flex flex-col items-center text-center p-4">
              <FileText className="w-10 h-10 mb-2 text-primary" />
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or HEIC (MAX. 10MB)
              </p>
            </div>
          )}
          <input
            id="menu-upload"
            name="menuImage"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/heic, image/heif"
            ref={inputRef}
            required
          />
        </label>
        <SubmitButton file={file} />
      </form>
    </div>
  );
}
