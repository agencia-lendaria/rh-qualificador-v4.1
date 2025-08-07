import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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

  const handleFileUpload = async (file: File) => {
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
  };

  const removeDocument = async (documentId: string) => {
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
  };

  return (
    <div className="flex flex-col h-screen bg-dark">
      {/* Header */}
      <div className="glass border-b border-gold/20 px-6 py-4 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-brand-purple/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Análises de Reuniões</h1>
                <p className="text-sm text-brand-gray">
                  Upload e análise de documentos de reuniões
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-brand-gray">
            <Calendar className="w-4 h-4" />
            <span>{documents.length} documento{documents.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-brand-magenta bg-brand-magenta/5'
                : 'border-brand-purple/30 hover:border-brand-purple/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
                  <p className="text-white font-medium">Fazendo upload...</p>
                  <p className="text-sm text-brand-gray">Processando documento e enviando para análise</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-brand-purple" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      {dragActive ? 'Solte o arquivo aqui' : 'Upload de Documento'}
                    </h3>
                    <p className="text-brand-gray">
                      Arraste e solte um arquivo ou{' '}
                      <button
                        onClick={handleFileSelect}
                        className="text-brand-magenta hover:text-brand-magenta/80 underline"
                        disabled={uploading}
                      >
                        selecione um arquivo
                      </button>
                    </p>
                    <p className="text-sm text-brand-gray">
                      Formatos aceitos: PDF, DOCX, TXT • Máximo 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-brand-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Nenhum documento enviado
                </h3>
                <p className="text-brand-gray">
                  Faça upload do primeiro documento para começar a análise.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Documentos Enviados ({documents.length})
                </h2>
                
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="bg-brand-darker/50 rounded-xl p-4 border border-brand-purple/20 hover:border-brand-purple/40 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-brand-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-brand-purple" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">
                              {document.name}
                            </h3>
                            <p className="text-sm text-brand-gray">
                              {document.uploadedAt.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Status Indicator */}
                          <div className="flex items-center space-x-2">
                            {document.status === 'processing' && (
                              <>
                                <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                                <span className="text-sm text-yellow-500">Processando</span>
                              </>
                            )}
                            {document.status === 'completed' && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-500">Concluído</span>
                              </>
                            )}
                            {document.status === 'error' && (
                              <>
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-500">Erro</span>
                              </>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeDocument(document.id)}
                            className="p-2 text-brand-gray hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            title="Remover documento"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {document.status === 'error' && document.error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400">{document.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsAnalysis;