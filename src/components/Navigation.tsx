import React from 'react';
import { MessageCircle, BarChart3, Users, Sparkles, Zap } from 'lucide-react';

interface NavigationProps {
  activeTab: 'chat' | 'dashboard' | 'meetings';
  onTabChange: (tab: 'chat' | 'dashboard' | 'meetings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="glass-effect px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-ping"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HR Intelligence
            </h1>
            <p className="text-sm text-text-secondary">Sistema Inteligente de Recrutamento</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="nav-modern">
          <button
            onClick={() => onTabChange('chat')}
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4" />
              {activeTab === 'chat' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
              )}
            </div>
            <span className="hidden md:block">Job Description</span>
          </button>
          
          <button
            onClick={() => onTabChange('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:block">Dashboard</span>
          </button>
          
          <button
            onClick={() => onTabChange('meetings')}
            className={`nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:block">Análises</span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="status-badge status-success">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:block">Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;