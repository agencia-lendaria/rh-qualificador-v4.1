import React, { memo } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UploadAreaProps {
  dragActive: boolean;
  uploading: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadArea = memo<UploadAreaProps>(({
  dragActive,
  uploading,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  fileInputRef,
  onFileChange
}) => {
  return (
    <Card className={`border-2 border-dashed transition-all duration-300 ${
      dragActive
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-primary/50'
    }`}>
      <CardContent 
        className="p-8 text-center"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={onFileChange}
          disabled={uploading}
          aria-label="Upload de documento"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-text-primary font-medium">Fazendo upload...</p>
              <p className="text-sm text-text-secondary">Processando documento e enviando para análise</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  {dragActive ? 'Solte o arquivo aqui' : 'Upload de Documento'}
                </h3>
                <p className="text-text-secondary">
                  Arraste e solte um arquivo ou{' '}
                  <Button
                    variant="ghost"
                    onClick={onFileSelect}
                    className="p-0 h-auto text-primary hover:text-primary-light underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    disabled={uploading}
                  >
                    selecione um arquivo
                  </Button>
                </p>
                <p className="text-sm text-text-muted">
                  Formatos aceitos: PDF, DOCX, TXT • Máximo 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

UploadArea.displayName = 'UploadArea';