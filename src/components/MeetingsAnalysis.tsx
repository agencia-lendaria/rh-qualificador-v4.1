import React, { useState, useRef, useCallback } from 'react';
import { Users, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Badge } from '@/components/ui/badge';
import { UploadArea } from './meetings-analysis/UploadArea';
import { DocumentsList } from './meetings-analysis/DocumentsList';

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

const MeetingsAnalysis: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('Apenas arquivos PDF, DOCX ou TXT são permitidos');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo deve ter menos de 10MB');
      return;
    }

    setUploading(true);

    try {
      // Create document entry
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${documentId}_${file.name}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('curriculum-uploads')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('curriculum-uploads')
        .getPublicUrl(fileName);

      // Add document to state
      const newDocument: UploadedDocument = {
        id: documentId,
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date(),
        status: 'processing'
      };

      setDocuments(prev => [newDocument, ...prev]);

      // Call webhook for analysis
      try {
        const webhookResponse = await fetch('https://n8nwebhook-ops.agencialendaria.ai/webhook/cv-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: documentId,
            document_name: file.name,
            document_url: publicUrl,
            timestamp: new Date().toISOString()
          })
        });

        if (!webhookResponse.ok) {
          throw new Error('Erro na análise do documento');
        }

        // Update document status to completed
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'completed' }
              : doc
          )
        );

      } catch (webhookError) {
        // Update document status to error
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'error', error: webhookError instanceof Error ? webhookError.message : 'Erro desconhecido' }
              : doc
          )
        );
      }

    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
    }
  }, []);

  const removeDocument = useCallback(async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    if (confirm('Tem certeza que deseja remover este documento?')) {
      try {
        // Remove from storage if exists
        const fileName = document.url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('curriculum-uploads')
            .remove([fileName]);
        }

        // Remove from state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error('Error removing document:', error);
      }
    }
  }, [documents]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="glass-effect border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">Análises de Reuniões</h1>
                <p className="text-sm text-text-secondary">
                  Upload e análise de documentos de reuniões
                </p>
              </div>
            </div>
          </div>
          
          <Badge variant="info" className="gap-1">
            <Calendar className="w-3 h-3" />
            <span>{documents.length} documento{documents.length !== 1 ? 's' : ''}</span>
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col space-y-6">
          <UploadArea
            dragActive={dragActive}
            uploading={uploading}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />

          <div className="flex-1 overflow-y-auto">
            <DocumentsList
              documents={documents}
              onRemoveDocument={removeDocument}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsAnalysis;