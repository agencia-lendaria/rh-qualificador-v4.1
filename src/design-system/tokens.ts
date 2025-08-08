// Centraliza tokens do design system referenciando CSS variables existentes
// Mantém tipagem estável para consumo em TS e cva

export const colors = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  popover: 'hsl(var(--popover))',
  popoverForeground: 'hsl(var(--popover-foreground))',
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))'
} as const

export type ColorToken = keyof typeof colors

export const radii = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)'
} as const

export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)'
} as const

export const transitions = {
  base: 'var(--transition-base)'
} as const

export const effects = {
  focusRingShadow: 'var(--focus-ring-shadow)'
} as const

export const tokens = {
  colors,
  radii,
  shadows,
  transitions,
  effects
} as const

export type Tokens = typeof tokens

