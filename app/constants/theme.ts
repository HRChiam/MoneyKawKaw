import { Platform } from 'react-native';

// Professional Fintech Color Scheme
const brandPrimary = '#1E3A8A'; // Deep Blue-900 (Trust & Authority)
const brandSecondary = '#3B82F6'; // Blue-500 (Actionable items)
const backgroundLight = '#F8FAFC'; // Slate-50 (Slightly off-white for depth)
const backgroundDark = '#0F172A'; // Slate-900 (Premium dark mode)

export const Colors = {
  light: {
    text: '#0F172A', // Slate-900 (High contrast readability)
    background: backgroundLight,
    tint: brandPrimary,
    icon: '#64748B', // Slate-500
    tabIconDefault: '#94A3B8',
    tabIconSelected: brandPrimary,
    
    // MoneyKawKaw Professional Colors
    primary: brandPrimary,
    primaryEnd: brandSecondary, 
    secondary: '#475569', // Slate-600 (For subtitles)
    success: '#059669', // Emerald-600 (Clean, banking green)
    warning: '#D97706', // Amber-600
    error: '#DC2626', // Red-600
    card: '#FFFFFF', // Pure white cards
    border: '#E2E8F0', // Slate-200 (Very subtle borders)
  },
  dark: {
    text: '#F8FAFC',
    background: backgroundDark,
    tint: brandSecondary,
    icon: '#94A3B8',
    tabIconDefault: '#475569',
    tabIconSelected: brandSecondary,
    
    // MoneyKawKaw Professional Colors
    primary: brandSecondary, // Use the lighter blue for dark mode visibility
    primaryEnd: '#60A5FA', // Blue-400
    secondary: '#94A3B8',
    success: '#10B981', // Emerald-500
    warning: '#F59E0B', 
    error: '#EF4444', 
    card: '#1E293B', // Slate-800
    border: '#334155', // Slate-700
  },
};