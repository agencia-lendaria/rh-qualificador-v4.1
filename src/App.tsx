import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ChatInterface from './components/ChatInterface';
import Formulario from './components/Formulario';
import FormsDashboard from './components/FormsDashboard';
import MeetingsAnalysis from './components/MeetingsAnalysis';
import BucketTest from './components/BucketTest';
import { supabase } from './lib/supabase';
import { env } from './config/env';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'assistant' | 'system';
  status: 'sending' | 'sent' | 'error';
}

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'meetings'>('chat');
  
  // Chat state moved to App level
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Load chat history from database
  const loadChatHistory = async (sessionId: string) => {
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
  };

  // Load chat history when session ID is set
  useEffect(() => {
    if (sessionId) {
      loadChatHistory(sessionId);
    }
  }, [sessionId]);

  // Function to save message to database
  const saveMessageToDatabase = async (message: Message) => {
    try {
      const chatHistoryData = {
        session_id: sessionId,
        message: {
          sender: message.sender,
          text: message.text,
          timestamp: message.timestamp.toISOString()
        }
      };

      const { error } = await supabase
        .from('formularios_chat_histories')
        .insert([chatHistoryData]);

      if (error) {
        console.error('Error saving message to database:', error);
      }
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  // Gerar Formulário handler
  const handleGenerateForm = async () => {
    setFormLoading(true);
    setFormSuccess(false);
    setFormError(null);
    try {
      // Find the last assistant message
      const lastAssistant = [...messages].reverse().find(m => m.sender === 'assistant');
      if (!lastAssistant) throw new Error('Nenhuma mensagem da IA encontrada.');
      const jobDescription = lastAssistant.text;
      
      // Generate questions from job description
      const questionsPayload = {
        jobDescription,
        session_id: sessionId
      };
      
      const questionsResp = await fetch(env.WEBHOOK_FORM_GENERATOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionsPayload)
      });
      
      if (!questionsResp.ok) throw new Error('Erro ao gerar perguntas.');
      
      const questionsData = await questionsResp.json();
      console.log('Questions webhook response:', questionsData);
      
      // Set success after receiving the response
      setFormSuccess(true);
      console.log('Questions generated successfully:', questionsData);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/formulario/:id" element={<Formulario />} />
        <Route path="/test-bucket" element={<BucketTest />} />
        <Route path="/" element={
          <div className="min-h-screen bg-dark flex flex-col">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 min-h-0">
              {activeTab === 'chat' ? (
                <ChatInterface 
                  messages={messages}
                  setMessages={setMessages}
                  sessionId={sessionId}
                  saveMessageToDatabase={saveMessageToDatabase}
                  formLoading={formLoading}
                  formSuccess={formSuccess}
                  formError={formError}
                  handleGenerateForm={handleGenerateForm}
                />
              ) : activeTab === 'dashboard' ? (
                <FormsDashboard />
              ) : (
                <MeetingsAnalysis />
              )}
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;