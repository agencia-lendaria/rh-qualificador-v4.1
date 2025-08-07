import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, AlertCircle, Check, Clock, Copy, CheckCheck, FileText } from 'lucide-react';
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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`max-w-xs lg:max-w-2xl px-5 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] relative ${
              message.sender === 'user'
                ? 'message-user'
                : message.sender === 'assistant'
                ? 'message-assistant'
                : 'message-system'
            }`}>
              {/* Copy button */}
              {(message.sender === 'assistant' || message.sender === 'user') && (
                <button
                  onClick={() => handleCopyMessage(message.text, message.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                    message.sender === 'user' 
                      ? 'hover:bg-dark/20 text-dark/70 hover:text-dark' 
                      : 'hover:bg-gold/20 text-gray hover:text-gold'
                  }`}
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
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-gold">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 text-gold">{children}</h4>,
                        p: ({ children }) => <p className="mb-2 leading-relaxed text-gray-200">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-gray-200">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-200">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-200">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gold">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-dark/50 px-1.5 py-0.5 rounded text-gold font-mono text-sm">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-dark/50 p-3 rounded-lg overflow-x-auto mb-2 border border-gold/20">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gold pl-4 italic text-gray-300 mb-2">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gold hover:text-gold/80 underline"
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
                  <p className="text-sm leading-relaxed break-words font-medium">{message.text}</p>
                )}
              </div>

              {/* Message footer */}
              <div className={`flex items-center justify-between mt-3 text-xs ${
                message.sender === 'user' 
                  ? 'text-dark/70' 
                  : message.sender === 'assistant'
                  ? 'text-gray'
                  : 'text-gray/70'
              }`}>
                <span className="font-medium">{formatTime(message.timestamp)}</span>
                {message.sender === 'user' && (
                  <div className="ml-2 flex items-center">
                    {getStatusIcon(message.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Gerar Formulário Button */}
      <div className="flex flex-col items-center justify-center py-2">
        <button
          onClick={handleGenerateForm}
          disabled={formLoading || !messages.length || messages[messages.length-1].sender !== 'assistant'}
          className={`p-4 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center mb-2 ${
            formLoading || !messages.length || messages[messages.length-1].sender !== 'assistant'
              ? 'bg-brand-gray/20 text-brand-gray/50 cursor-not-allowed'
              : 'btn-gold text-white hover:shadow-gold active:scale-95'
          }`}
        >
          {formLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Gerar Formulário
            </>
          )}
        </button>
        {formSuccess && (
          <div className="flex items-center text-green-500 text-sm font-medium">
            <Check className="w-4 h-4 mr-1" /> Formulário criado com sucesso!
          </div>
        )}
        {formError && (
          <div className="flex items-center text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-1" /> {formError}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="glass border-t border-gold/20 px-4 py-6 shadow-elegant">
        <div className="flex items-end space-x-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-5 py-4 input-elegant rounded-2xl focus:outline-none resize-none transition-all duration-300 max-h-32 font-medium"
              rows={1}
              style={{
                minHeight: '56px',
                height: 'auto',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
              disabled={false}
              readOnly={isLoading}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-4 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center ${
              !inputText.trim() || isLoading
                ? 'bg-brand-gray/20 text-brand-gray/50 cursor-not-allowed'
                : 'btn-magenta text-white hover:shadow-magenta active:scale-95'
            }`}
          >
            <Send className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        
        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center justify-center mt-4 space-x-2 text-brand-magenta text-sm font-medium">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-brand-magenta rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-brand-magenta rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-brand-magenta rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Processando...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;