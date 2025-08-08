import React, { memo, useMemo } from 'react';
import { FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

interface DocumentsListProps {
  documents: UploadedDocument[];
  onRemoveDocument: (documentId: string) => void;
}

// Memoized document item component
const DocumentItem = memo<{ 
  document: UploadedDocument; 
  onRemove: (id: string) => void; 
}>(({ document, onRemove }) => {
  const formattedDate = useMemo(() => {
    return document.uploadedAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [document.uploadedAt]);

  return (
    <Card
      className="modern-card hover:scale-[1.02] transition-all duration-300"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-text-primary font-medium truncate">
                {document.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            {document.status === 'processing' && (
              <Badge variant="warning" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processando</span>
              </Badge>
            )}
            {document.status === 'completed' && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Concluído</span>
              </Badge>
            )}
            {document.status === 'error' && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Erro</span>
              </Badge>
            )}

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(document.id)}
              className="p-2 text-text-muted hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
              title="Remover documento"
              aria-label={`Remover documento ${document.name}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {document.status === 'error' && document.error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{document.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DocumentItem.displayName = 'DocumentItem';

export const DocumentsList = memo<DocumentsListProps>(({
  documents,
  onRemoveDocument
}) => {
  if (documents.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Nenhum documento enviado
          </h3>
          <p className="text-text-secondary">
            Faça upload do primeiro documento para começar a análise.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">
        Documentos Enviados ({documents.length})
      </h2>
      
      <div className="space-y-3">
        {documents.map((document) => (
          <DocumentItem
            key={document.id}
            document={document}
            onRemove={onRemoveDocument}
          />
        ))}
      </div>
    </div>
  );
});

DocumentsList.displayName = 'DocumentsList';