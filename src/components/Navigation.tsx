import { MessageCircle, BarChart3, Users, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NavigationProps {
  activeTab: 'chat' | 'dashboard' | 'meetings'
  onTabChange: (tab: 'chat' | 'dashboard' | 'meetings') => void
}

function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="glass-effect px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[color:#10b981] rounded-full border-2 border-background" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">HR Intelligence</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Sistema Inteligente de Recrutamento</p>
          </div>
        </div>

        <div className="nav-modern flex-shrink-0" role="tablist" aria-label="Navegação principal">
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'secondary'}
            className="nav-item px-2 sm:px-3 py-2 text-xs sm:text-sm"
            onClick={() => onTabChange('chat')}
            aria-current={activeTab === 'chat' ? 'page' : undefined}
            aria-pressed={activeTab === 'chat' || undefined}
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4" />
              {activeTab === 'chat' && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <span className="hidden sm:block">Job Description</span>
          </Button>

          <Button
            variant={activeTab === 'dashboard' ? 'primary' : 'secondary'}
            className="nav-item px-2 sm:px-3 py-2 text-xs sm:text-sm"
            onClick={() => onTabChange('dashboard')}
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            aria-pressed={activeTab === 'dashboard' || undefined}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </Button>

          <Button
            variant={activeTab === 'meetings' ? 'primary' : 'secondary'}
            className="nav-item px-2 sm:px-3 py-2 text-xs sm:text-sm"
            onClick={() => onTabChange('meetings')}
            aria-current={activeTab === 'meetings' ? 'page' : undefined}
            aria-pressed={activeTab === 'meetings' || undefined}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:block">Análises</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Badge variant="success" className="gap-1 px-2 py-1 text-xs">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:block">Online</span>
          </Badge>
        </div>
      </div>
    </nav>
  )
}

export default Navigation