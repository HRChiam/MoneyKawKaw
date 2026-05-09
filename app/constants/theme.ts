import { Platform } from 'react-native';

// MoneyKawKaw Color Scheme
const tintColorLight = '#0a7ea4';
const primaryGradientStart = '#771fff'; // Purple
const primaryGradientEnd = '#f8326d'; // Pink
const tintColorDark = primaryGradientStart;

// Dark color scheme for both light and dark modes
const darkColorScheme = {
  text: '#ECEDEE',
  background: '#0C0121',
  tint: tintColorDark,
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: primaryGradientEnd,
  // MoneyKawKaw specific colors
  primary: primaryGradientStart,
  primaryEnd: primaryGradientEnd,
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  card: '#2a2336',
  border: '#3f3751',
};

export const Colors = {
  light: darkColorScheme,
  dark: darkColorScheme,
};

/**
 * Reusable Gradient Configurations
 * Use with GradientView component for buttons, backgrounds, text, etc.
 */
export const Gradients = {
  primary: {
    colors: [primaryGradientStart, primaryGradientEnd],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primaryReverse: {
    colors: [primaryGradientEnd, primaryGradientStart],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  horizontal: {
    colors: [primaryGradientStart, primaryGradientEnd],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  vertical: {
    colors: [primaryGradientStart, primaryGradientEnd],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
  diagonalReverse: {
    colors: [primaryGradientEnd, primaryGradientStart],
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 },
  },
};

export const Fonts = {
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
} as const;