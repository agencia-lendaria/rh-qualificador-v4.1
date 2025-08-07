import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, AlertCircle, Check, Clock, Copy, CheckCheck, FileText, Sparkles, MessageCircle, User, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'assistant' | 'system';
  status: 'sending' | 'sent' | 'error';
}

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionId: string | null;
  saveMessageToDatabase: (message: Message) => Promise<void>;
  formLoading: boolean;
  formSuccess: boolean;
  formError: string | null;
  handleGenerateForm: () => Promise<void>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  setMessages,
  sessionId,
  saveMessageToDatabase,
  formLoading,
  formSuccess,
  formError,
  handleGenerateForm
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from database
  const loadChatHistory = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('formularios_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map(item => ({
          id: item.id.toString(),
          text: item.message.text,
          timestamp: new Date(item.message.timestamp),
          sender: item.message.sender,
          status: 'sent'
        }));

        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [setMessages]);

  // Load chat history when session ID is set
  useEffect(() => {
    if (sessionId) {
      loadChatHistory(sessionId);
    }
  }, [sessionId, loadChatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopyMessage = async (messageText: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      sender: 'user',
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Restore focus to input after clearing text
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    // Save user message to database
    await saveMessageToDatabase(userMessage);

    try {
      const response = await fetch(env.WEBHOOK_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          timestamp: new Date().toISOString(),
          sender: 'user',
          session_id: sessionId
        })
      });

      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: response.ok ? 'sent' : 'error' }
            : msg
        )
      );

      if (response.ok) {
        const data = await response.json();
        
        // Debug: Log the actual response structure
        console.log('Webhook response:', data);
        console.log('Response type:', typeof data);
        console.log('Response keys:', Object.keys(data || {}));
        
        // If webhook returns a response, show it
        if (data) {
          let responseText = '';
          
          // Handle different response formats
          if (typeof data === 'string') {
            responseText = data;
          } else if (typeof data === 'object' && data !== null) {
            // Try common field names first
            const commonFields = [
              'message', 'response', 'reply', 'text', 'content', 'answer', 
              'output', 'result', 'jobDescription', 'job_description', 
              'description', 'data', 'body'
            ];
            
            // Check for common field names
            for (const field of commonFields) {
              if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
                responseText = data[field];
                break;
              }
            }
            
            // If no common fields found, look for any string value
            if (!responseText) {
              const allValues = Object.values(data);
              const stringValues = allValues.filter(value => 
                typeof value === 'string' && value.trim().length > 5
              ) as string[];
              
              if (stringValues.length > 0) {
                // Use the longest string value
                responseText = stringValues.reduce((longest, current) => 
                  current.length > longest.length ? current : longest
                );
              }
            }
            
            // If still no text found, try to extract from nested objects
            if (!responseText) {
              const extractTextFromObject = (obj: Record<string, unknown>, depth = 0): string => {
                if (depth > 3) return ''; // Prevent infinite recursion
                
                for (const [, value] of Object.entries(obj)) {
                  if (typeof value === 'string' && value.trim().length > 10) {
                    return value;
                  } else if (typeof value === 'object' && value !== null) {
                    const nested = extractTextFromObject(value as Record<string, unknown>, depth + 1);
                    if (nested) return nested;
                  }
                }
                return '';
              };
              
              responseText = extractTextFromObject(data);
            }
            
            // Last resort: format as key-value pairs
            if (!responseText) {
              const entries = Object.entries(data)
                .filter(([key, value]) => 
                  typeof value === 'string' && value.trim() && 
                  !key.toLowerCase().includes('id') && 
                  !key.toLowerCase().includes('timestamp')
                )
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
              
              responseText = entries || JSON.stringify(data, null, 2);
            }
          }
          
          if (responseText) {
            // Clean up and format the response
            responseText = responseText
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
              .replace(/\n\s*\n\s*\n/g, '\n\n')
              .replace(/^\s+|\s+$/g, '')
              .trim();
            
            console.log('Final response text:', responseText);
            
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: responseText,
              timestamp: new Date(),
              sender: 'assistant',
              status: 'sent'
            };
            setMessages(prev => [...prev, assistantMessage]);
            
            // Save assistant message to database
            await saveMessageToDatabase(assistantMessage);
          }
        }
      } else {
        // Handle error response
        try {
          const errorData = await response.json();
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: errorData.message || errorData.error || 'Erro ao processar mensagem',
            timestamp: new Date(),
            sender: 'system',
            status: 'sent'
          };
          setMessages(prev => [...prev, errorMessage]);
          
          // Save error message to database
          await saveMessageToDatabase(errorMessage);
        } catch {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Erro ao processar mensagem',
            timestamp: new Date(),
            sender: 'system',
            status: 'sent'
          };
          setMessages(prev => [...prev, errorMessage]);
          
          // Save error message to database
          await saveMessageToDatabase(errorMessage);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Desculpe, houve um erro ao enviar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        sender: 'system',
        status: 'sent'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to database
      await saveMessageToDatabase(errorMessage);
    } finally {
      setIsLoading(false);
      // Ensure focus is restored after loading is complete
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      // Focus will be restored by handleSendMessage
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 status-sending animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 status-sent" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 status-error" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Welcome Header */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl mx-auto animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Bem-vindo ao HR Intelligence
            </h2>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Crie job descriptions personalizadas usando IA. Descreva a vaga que você precisa e deixe nossa inteligência artificial criar o conteúdo perfeito para você.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="modern-card p-4 text-left">
                <MessageCircle className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-semibold text-text-primary mb-1">Conversação Natural</h3>
                <p className="text-sm text-text-secondary">Descreva a vaga em suas próprias palavras</p>
              </div>
              <div className="modern-card p-4 text-left">
                <FileText className="w-6 h-6 text-secondary mb-2" />
                <h3 className="font-semibold text-text-primary mb-1">Formulários Automáticos</h3>
                <p className="text-sm text-text-secondary">Gere formulários de candidatura automaticamente</p>
              </div>
            </div>
            <div className="text-text-muted text-sm">
              💡 Dica: Seja específico sobre requisitos, benefícios e cultura da empresa
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="animate-fade-in group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`flex items-start space-x-4 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`avatar avatar-sm flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary-dark' 
                      : message.sender === 'assistant'
                      ? 'bg-gradient-to-br from-secondary to-secondary-dark'
                      : 'bg-text-muted'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : message.sender === 'assistant' ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 min-w-0 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block max-w-full chat-message ${
                      message.sender === 'user'
                        ? 'chat-message-user'
                        : message.sender === 'assistant'
                        ? 'chat-message-assistant'
                        : 'chat-message-system'
                    } px-6 py-4 relative`}>
                      {/* Copy button */}
                      {(message.sender === 'assistant' || message.sender === 'user') && (
                        <button
                          onClick={() => handleCopyMessage(message.text, message.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-black/10"
                          title="Copiar mensagem"
                        >
                          {copiedMessageId === message.id ? (
                            <CheckCheck className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* Message content */}
                      <div className="pr-8">
                        {message.sender === 'assistant' ? (
                          <div className="markdown-content">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-text-primary">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-text-primary">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-primary">{children}</h3>,
                                h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 text-primary">{children}</h4>,
                                p: ({ children }) => <p className="mb-3 leading-relaxed text-text-primary">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-text-primary ml-4">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-text-primary ml-4">{children}</ol>,
                                li: ({ children }) => <li className="text-text-primary">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                                em: ({ children }) => <em className="italic text-primary">{children}</em>,
                                code: ({ children }) => (
                                  <code className="bg-surface px-1.5 py-0.5 rounded text-primary font-mono text-sm">
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-surface p-4 rounded-lg overflow-x-auto mb-3 border border-border">
                                    {children}
                                  </pre>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-primary pl-4 italic text-text-secondary mb-3">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary-light underline"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="leading-relaxed break-words">{message.text}</p>
                        )}
                      </div>

                      {/* Message footer */}
                      <div className="flex items-center justify-between mt-3 text-xs opacity-70">
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && (
                          <div className="ml-2 flex items-center">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Form Button */}
      {messages.length > 0 && messages[messages.length-1].sender === 'assistant' && (
        <div className="px-4 py-2 border-t border-border bg-surface">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={handleGenerateForm}
              disabled={formLoading}
              className={`btn-modern btn-success shimmer-button ${
                formLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gerando Formulário...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Gerar Formulário
                </>
              )}
            </button>
          </div>
          {formSuccess && (
            <div className="flex justify-center mt-2">
              <div className="status-badge status-success">
                <Check className="w-4 h-4" />
                Formulário criado com sucesso!
              </div>
            </div>
          )}
          {formError && (
            <div className="flex justify-center mt-2">
              <div className="status-badge status-error">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modern Input Area */}
      <div className="border-t border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3">
            {/* Input Container */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoading ? "Aguardando resposta..." : "Digite sua mensagem... (Shift + Enter para nova linha)"}
                className="input-modern w-full min-h-[52px] max-h-32 resize-none pr-12"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
                disabled={isLoading}
              />
              
              {/* Loading Indicator in Input */}
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`btn-modern ${
                !inputText.trim() || isLoading
                  ? 'bg-surface-elevated text-text-muted cursor-not-allowed'
                  : 'btn-primary shimmer-button'
              } p-3 rounded-xl`}
            >
              <Send className={`w-5 h-5 ${isLoading ? 'opacity-50' : ''}`} />
            </button>
          </div>
          
          {/* Enhanced Typing Indicator */}
          {isLoading && (
            <div className="typing-indicator mt-3 justify-center">
              <div className="avatar avatar-sm bg-gradient-to-br from-secondary to-secondary-dark mr-2">
                <Zap className="w-3 h-3" />
              </div>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span className="ml-2 text-text-secondary">HR Intelligence está processando...</span>
            </div>
          )}

          {/* Quick Actions */}
          {!isLoading && inputText.trim() === '' && messages.length === 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "Preciso de uma vaga para desenvolvedor frontend",
                "Quero criar um job description para marketing",
                "Vaga para analista de dados júnior",
                "Posição de gerente de projetos"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(suggestion)}
                  className="btn-modern btn-secondary text-sm px-3 py-2 text-text-secondary hover:text-text-primary animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;