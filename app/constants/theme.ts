import { Platform } from 'react-native';

// MoneyKawKaw Color Scheme
const gxPurple = '#771fff'; 
const gxPurpleLight = '#9d5eff'; // Lighter purple for subtle gradients
const gxPink = '#f8326d'; // Secondary accent / Gradient end
const tintColorDark = gxPurple;

// Dark color scheme for both light and dark modes
const darkColorScheme = {
  text: '#ECEDEE',
  background: '#0C0121',
  tint: tintColorDark,
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: gxPurple,
  // MoneyKawKaw specific colors
  primary: gxPurple,
  primaryEnd: gxPurpleLight, // Lighter purple for primary elements
  accent: gxPink, // GX Pink for high-impact accents
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
  // Pure Purple Gradient
  primary: {
    colors: [gxPurple, gxPurpleLight],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // GX Signature Purple to Pink Gradient
  signature: {
    colors: [gxPurple, gxPink],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  horizontal: {
    colors: [gxPurple, gxPink],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  vertical: {
    colors: [gxPurple, gxPink],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
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
