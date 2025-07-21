import React from 'react';
import { MessageCircle, BarChart3 } from 'lucide-react';

interface NavigationProps {
  activeTab: 'chat' | 'dashboard';
  onTabChange: (tab: 'chat' | 'dashboard') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="glass border-b border-gold/20 px-6 py-4 shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 gradient-magenta rounded-full flex items-center justify-center shadow-magenta">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green rounded-full border-2 border-brand-dark animate-pulse-magenta"></div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Sistema de Geração</h1>
              <p className="text-sm text-brand-gray">Ferramentas de RH Inteligentes</p>
            </div>
          </div>
          
          <div className="flex space-x-1 bg-brand-darker/50 rounded-xl p-1">
            <button
              onClick={() => onTabChange('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                activeTab === 'chat'
                  ? 'bg-brand-magenta text-white shadow-magenta'
                  : 'text-brand-gray hover:text-white hover:bg-brand-dark/50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Gerador de Job Description</span>
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-brand-gold text-white shadow-gold-button'
                  : 'text-brand-gray hover:text-white hover:bg-brand-dark/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard de Formulários</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;