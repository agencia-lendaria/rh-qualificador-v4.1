import React from 'react';
import { Sun, Moon, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Tema Claro', icon: Sun },
    { value: 'dark', label: 'Tema Escuro', icon: Moon },
    { value: 'hc', label: 'Alto Contraste', icon: Contrast },
  ] as const;

  const currentThemeIndex = themeOptions.findIndex(option => option.value === theme);
  const nextTheme = themeOptions[(currentThemeIndex + 1) % themeOptions.length];

  const handleThemeChange = () => {
    setTheme(nextTheme.value);
  };

  const CurrentIcon = themeOptions.find(option => option.value === theme)?.icon || Moon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeChange}
      aria-label={`Trocar para ${nextTheme.label}`}
      title={`Tema atual: ${themeOptions.find(option => option.value === theme)?.label}. Clique para trocar para ${nextTheme.label}`}
      className="h-9 w-9 px-0"
    >
      <CurrentIcon className="h-4 w-4 transition-all" />
      <span className="sr-only">
        Alternar tema. Tema atual: {themeOptions.find(option => option.value === theme)?.label}
      </span>
    </Button>
  );
};

export default ThemeToggle;