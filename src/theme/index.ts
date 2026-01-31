/**
 * Linear/Modern 设计系统主题配置
 *
 * 基于 MUI Theme，扩展为 Linear 风格的设计令牌
 * 包含：深空色板、排版系统、阴影系统、动画系统
 *
 * @module theme
 */

import { createTheme } from '@mui/material/styles';

/**
 * 设计令牌 - 颜色系统
 */
const designTokens = {
  colors: {
    background: {
      deep: '#020203',
      base: '#050506',
      elevated: '#0a0a0c',
    },
    surface: {
      default: 'rgba(255,255,255,0.05)',
      hover: 'rgba(255,255,255,0.08)',
    },
    foreground: {
      primary: '#EDEDEF',
      muted: '#8A8F98',
      subtle: 'rgba(255,255,255,0.60)',
    },
    accent: {
      primary: '#5E6AD2',
      bright: '#6872D9',
      glow: 'rgba(94,106,210,0.30)',
    },
    border: {
      default: 'rgba(255,255,255,0.06)',
      hover: 'rgba(255,255,255,0.10)',
      accent: 'rgba(94,106,210,0.30)',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 600,
      blob: 8000,
    },
    easing: {
      expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeOut: 'ease-out',
    },
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
  },
};

/**
 * 创建暗色主题（默认）
 */
export const createDarkTheme = () => createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: designTokens.colors.background.base,
      paper: designTokens.colors.background.elevated,
    },
    primary: {
      main: designTokens.colors.accent.primary,
      light: designTokens.colors.accent.bright,
    },
    text: {
      primary: designTokens.colors.foreground.primary,
      secondary: designTokens.colors.foreground.muted,
    },
    divider: designTokens.colors.border.default,
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily,
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: designTokens.radius.md,
  },
  transitions: {
    duration: {
      shortest: designTokens.animation.duration.fast,
      shorter: designTokens.animation.duration.fast,
      short: designTokens.animation.duration.normal,
      standard: designTokens.animation.duration.normal,
      complex: designTokens.animation.duration.slow,
    },
    easing: {
      sharp: designTokens.animation.easing.expoOut,
      easeInOut: designTokens.animation.easing.expoOut,
    },
  },
  shadows: [
    'none',
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.hover}, 0 8px 40px rgba(0,0,0,0.5), 0 0 80px ${designTokens.colors.accent.glow}`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)`,
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${designTokens.colors.border.default}`,
          borderRadius: designTokens.radius.lg,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
            borderRadius: `${designTokens.radius.lg}px ${designTokens.radius.lg}px 0 0`,
          },
          '&:hover': {
            borderColor: designTokens.colors.border.hover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: designTokens.radius.sm,
          fontWeight: 500,
          transition: `all ${designTokens.animation.duration.fast}ms ${designTokens.animation.easing.expoOut}`,
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          background: designTokens.colors.accent.primary,
          color: '#ffffff',
          boxShadow: `0 0 0 1px ${designTokens.colors.accent.glow}, 0 4px 12px ${designTokens.colors.accent.glow}, inset 0 1px 0 0 rgba(255,255,255,0.2)`,
          '&:hover': {
            background: designTokens.colors.accent.bright,
            boxShadow: `0 0 0 1px ${designTokens.colors.accent.glow}, 0 6px 20px ${designTokens.colors.accent.glow}, inset 0 1px 0 0 rgba(255,255,255,0.3)`,
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          background: designTokens.colors.surface.default,
          color: designTokens.colors.foreground.primary,
          border: 'none',
          boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.1)`,
          '&:hover': {
            background: designTokens.colors.surface.hover,
            boxShadow: `0 0 0 1px ${designTokens.colors.border.hover}, 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.1)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: designTokens.colors.background.elevated,
            '& fieldset': {
              borderColor: designTokens.colors.border.default,
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: designTokens.colors.border.hover,
            },
            '&.Mui-focused fieldset': {
              borderColor: designTokens.colors.accent.primary,
              boxShadow: `0 0 0 2px ${designTokens.colors.accent.glow}`,
            },
          },
          '& .MuiInputLabel-root': {
            color: designTokens.colors.foreground.muted,
            '&.Mui-focused': {
              color: designTokens.colors.accent.primary,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${designTokens.colors.border.default}`,
          borderRadius: designTokens.radius.lg,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              color: designTokens.colors.accent.primary,
            },
            '&.Mui-checked + .MuiSwitch-track': {
              backgroundColor: designTokens.colors.accent.primary,
            },
          },
        },
      },
    },
  },
});

/**
 * 创建浅色主题
 */
export const createLightTheme = () => createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    primary: {
      main: designTokens.colors.accent.primary,
      light: designTokens.colors.accent.bright,
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: designTokens.colors.border.default,
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: `1px solid ${designTokens.colors.border.default}`,
          borderRadius: designTokens.radius.lg,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
  },
});

export default designTokens;
