/**
 * Kwarta Design System & Theme Tokens
 * Premium Dark Mode Fintech Aesthetic
 */

export const Colors = {
  // Brand & Accent
  emerald: {
    primary: '#10B981',
    dark: '#059669',
    light: '#34D399',
    surface: '#064E3B',
    muted: 'rgba(16, 185, 129, 0.15)',
  },

  // Dark Theme Surfaces
  background: {
    main: '#0B1220',
    surface: '#151F30',
    elevated: '#1E293B',
    card: '#151F30',
    modal: '#1E293B',
  },

  // Typography Colors
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0B1220',
  },

  // Borders & Dividers
  border: {
    default: '#334155',
    subtle: '#1E293B',
    highlight: '#475569',
  },

  // Semantic Financial Feedback
  status: {
    income: '#10B981',
    expense: '#F87171',
    warning: '#FBBF24',
    info: '#38BDF8',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export type ThemeColors = typeof Colors;
export type ThemeSpacing = typeof Spacing;
export type ThemeBorderRadius = typeof BorderRadius;
