import { createTheme, Theme } from '@mui/material/styles';

// Color palette for the MBTI personality test
export const MBTI_COLORS = {
  // Primary theme colors
  primary: '#7CE2FF',
  primaryHover: '#5DCBF0',
  primaryLight: 'rgba(124, 226, 255, 0.1)',
  
  // Panel and background colors
  panelPrimary: '#4A6E8D',
  panelSecondary: '#5A7E9D',
  panelAnimation: '#5A8DB5',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0BEC5',
  textDark: '#000000',
  
  // Background colors
  backgroundDark: '#1E1E1E',
  borderDark: '#333',
  
  // Button colors
  buttonGreen: '#4CAF50',
  buttonGreenHover: '#45a049',
  buttonBlue: '#2196F3',
  buttonBlueHover: '#1976D2',
  
  // Semantic colors
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FF9800',
  error: '#F44336',
} as const;

// Grid colors interface for backward compatibility
export interface GridColors {
  panel: string;
  linkColor: string;
  selectedPanel: string;
}

// Default grid colors object
export const defaultGridColors: GridColors = {
  panel: MBTI_COLORS.panelPrimary,
  linkColor: MBTI_COLORS.primary,
  selectedPanel: MBTI_COLORS.panelSecondary,
};

// Common animation and transition values
export const MBTI_ANIMATIONS = {
  transition: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
    easeInOut: 'all 0.3s ease-in-out',
  },
  transform: {
    scale: 'scale(1.02)',
    scaleSmall: 'scale(1.1)',
  },
  boxShadow: {
    default: '0 2px 10px rgba(0,0,0,0.1)',
    elevated: '0 8px 25px rgba(0,0,0,0.3)',
  },
} as const;

// Common styling patterns
export const MBTI_STYLES = {
  // Panel styles
  panel: {
    p: 2,
    borderRadius: 2,
    bgcolor: MBTI_COLORS.panelPrimary,
  },
  
  panelSelected: {
    p: 2,
    borderRadius: 2,
    bgcolor: MBTI_COLORS.panelSecondary,
  },
  
  // Button styles
  primaryButton: {
    bgcolor: MBTI_COLORS.primary,
    color: MBTI_COLORS.textDark,
    '&:hover': {
      bgcolor: MBTI_COLORS.primaryHover,
    },
  },
  
  outlinedButton: {
    color: MBTI_COLORS.primary,
    borderColor: MBTI_COLORS.primary,
    '&:hover': {
      borderColor: MBTI_COLORS.primary,
      backgroundColor: MBTI_COLORS.primaryLight,
    },
  },
  
  // Icon button styles
  iconButton: {
    color: MBTI_COLORS.primary,
    '&:hover': {
      backgroundColor: MBTI_COLORS.primaryLight,
    },
  },
  
  // Text styles
  secondaryText: {
    color: MBTI_COLORS.textSecondary,
  },
  
  // Animation styles
  animatingElement: {
    transition: MBTI_ANIMATIONS.transition.easeInOut,
    transform: MBTI_ANIMATIONS.transform.scale,
    boxShadow: MBTI_ANIMATIONS.boxShadow.elevated,
    opacity: 0.7,
  },
  
  // Navigation arrow styles
  navigationArrow: {
    color: MBTI_COLORS.primary,
    minWidth: 'auto',
    p: 0.5,
    fontSize: '1.2rem',
    height: '32px',
    width: '32px',
    transition: MBTI_ANIMATIONS.transition.fast,
    '&:hover': {
      transform: MBTI_ANIMATIONS.transform.scaleSmall,
      backgroundColor: MBTI_COLORS.primaryLight,
    },
  },
  
  // Switch styles
  switchComponent: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: MBTI_COLORS.primary,
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: MBTI_COLORS.primary,
    },
  },
  
  // Modal styles
  modalPaper: {
    borderRadius: 2,
    bgcolor: MBTI_COLORS.backgroundDark,
    color: MBTI_COLORS.textPrimary,
    border: `1px solid ${MBTI_COLORS.borderDark}`,
  },
  
  modalDivider: {
    borderBottom: `1px solid ${MBTI_COLORS.borderDark}`,
  },
  
  // Question card button styles
  questionButtonGreen: {
    bgcolor: MBTI_COLORS.buttonGreen,
    '&:hover': { bgcolor: MBTI_COLORS.buttonGreenHover },
    flex: 1,
    maxWidth: { sm: '300px' },
    minHeight: '80px',
    p: 2,
    textAlign: 'center',
    whiteSpace: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  questionButtonBlue: {
    bgcolor: MBTI_COLORS.buttonBlue,
    '&:hover': { bgcolor: MBTI_COLORS.buttonBlueHover },
    flex: 1,
    maxWidth: { sm: '300px' },
    minHeight: '80px',
    p: 2,
    textAlign: 'center',
    whiteSpace: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const;

// Create MUI theme with custom colors
export const createMBTITheme = (): Theme => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: MBTI_COLORS.primary,
      },
      secondary: {
        main: MBTI_COLORS.panelPrimary,
      },
      background: {
        default: '#1B3A57',
        paper: MBTI_COLORS.panelPrimary,
      },
      text: {
        primary: MBTI_COLORS.textPrimary,
        secondary: MBTI_COLORS.textSecondary,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
              transition: MBTI_ANIMATIONS.transition.fast,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

// Utility functions for common styling operations
export const getAnimatedStyles = (isAnimating: boolean) => ({
  bgcolor: isAnimating ? MBTI_COLORS.panelAnimation : MBTI_COLORS.panelPrimary,
  transition: MBTI_ANIMATIONS.transition.easeInOut,
  transform: isAnimating ? MBTI_ANIMATIONS.transform.scale : 'scale(1)',
  boxShadow: isAnimating ? MBTI_ANIMATIONS.boxShadow.elevated : MBTI_ANIMATIONS.boxShadow.default,
});

export const getTypeHighlightStyles = (isHighlighted: boolean) => ({
  color: isHighlighted ? MBTI_COLORS.primary : 'inherit',
  fontWeight: isHighlighted ? 'bold' : 'normal',
});

export const getMatchBorderStyles = (isMainType: boolean) => ({
  border: `2px solid ${isMainType ? MBTI_COLORS.primary : '#666'}`,
  bgcolor: isMainType ? MBTI_COLORS.primaryLight : 'rgba(255, 255, 255, 0.05)',
});
