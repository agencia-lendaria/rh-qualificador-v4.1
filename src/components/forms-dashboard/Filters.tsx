import React from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export type FilterStatus = 'all' | 'active' | 'draft' | 'closed'
export type SortBy = 'date' | 'name' | 'candidates' | 'score'

export interface FiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: FilterStatus
  onFilterChange: (value: FilterStatus) => void
  sortBy: SortBy
  onSortChange: (value: SortBy) => void
}

export function Filters({ searchTerm, onSearchChange, filterStatus, onFilterChange, sortBy, onSortChange }: FiltersProps) {
  return (
    <div className="p-4 sm:p-6 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-center lg:justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar formulários..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm w-full"
              aria-label="Buscar formulários"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center lg:flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-text-secondary" />
              <Select 
                value={filterStatus} 
                onChange={(e) => onFilterChange(e.target.value as FilterStatus)} 
                aria-label="Filtrar por status" 
                className="select-filter min-w-[120px] text-sm font-medium"
              >
                <option value="all" className="text-text-primary bg-surface-raised">Todos</option>
                <option value="active" className="text-text-primary bg-surface-raised">Ativos</option>
                <option value="draft" className="text-text-primary bg-surface-raised">Rascunhos</option>
                <option value="closed" className="text-text-primary bg-surface-raised">Fechados</option>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary whitespace-nowrap font-medium">Ordenar:</span>
              <Select 
                value={sortBy} 
                onChange={(e) => onSortChange(e.target.value as SortBy)} 
                aria-label="Ordenar por" 
                className="select-filter min-w-[120px] text-sm font-medium"
              >
                <option value="date" className="text-text-primary bg-surface-raised">Data</option>
                <option value="name" className="text-text-primary bg-surface-raised">Nome</option>
                <option value="candidates" className="text-text-primary bg-surface-raised">Candidatos</option>
                <option value="score" className="text-text-primary bg-surface-raised">Score</option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

