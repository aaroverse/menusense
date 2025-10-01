'use client';

import { useRef } from 'react';
import { Upload, FileText, X, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ReadyViewProps {
  onSubmit: () => void;
  onFileChange: (file: File | null) => void;
  file: File | null;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function ReadyView({ onSubmit, onFileChange, file, language, onLanguageChange }: ReadyViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    onFileChange(selectedFile || null);
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    onSubmit();
  };

  const languages = ['Chinese', 'English', 'Japanese', 'Korean'];

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
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Collapsible className="w-full text-left">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-center text-sm">
              <ChevronsUpDown className="w-4 h-4 mr-2" />
              Advanced Options
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-2">
            <div className="grid items-center gap-2">
              <Label htmlFor="language-select">Translate to:</Label>
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger id="language-select">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!file}
        >
          Decode Menu
        </Button>
      </form>
    </div>
  );
}
