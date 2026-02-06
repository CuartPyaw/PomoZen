/**
 * 中国禅意设计系统主题配置
 *
 * 基于 MUI Theme，扩展为禅意风格的设计令牌
 * 配色方案：竹林清风
 * 包含：宣纸色板、排版系统、阴影系统、动画系统
 *
 * @module theme
 */

import { createTheme } from '@mui/material/styles';

/**
 * 设计令牌 - 颜色系统（竹林清风配色）
 */
const designTokens = {
  colors: {
    background: {
      deep: '#E0D9CD',      // 深宣纸色
      base: '#F0ECE5',      // 宣纸白基础
      elevated: '#F5F2EB',  // 宣纸白悬浮
    },
    surface: {
      default: 'rgba(44,44,44,0.04)',     // 淡墨表面
      hover: 'rgba(44,44,44,0.08)',        // 悬停淡墨
    },
    foreground: {
      primary: '#2C2C2C',     // 墨黑
      muted: '#6A6A6A',       // 淡墨
      subtle: 'rgba(44,44,44,0.55)',  // 细腻墨色
    },
    accent: {
      primary: '#7A918D',     // 竹青
      bright: '#8FA398',      // 竹青亮
      glow: 'rgba(122,145,141,0.30)',  // 竹青辉光
    },
    border: {
      default: 'rgba(44,44,44,0.08)',   // 淡墨边框
      hover: 'rgba(44,44,44,0.12)',     // 悬停边框
      accent: 'rgba(122,145,141,0.30)', // 竹青边框
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
 * 创建禅意主题（默认）
 */
export const createZenTheme = () => createTheme({
  palette: {
    mode: 'light',
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
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.hover}, 0 4px 12px rgba(44,44,44,0.12), 0 12px 24px ${designTokens.colors.accent.glow}`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
    `0 0 0 1px ${designTokens.colors.border.default}, 0 2px 8px rgba(44,44,44,0.08), 0 8px 16px rgba(44,44,44,0.04)`,
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: designTokens.colors.background.elevated,
          border: `1px solid ${designTokens.colors.border.default}`,
          borderRadius: designTokens.radius.lg,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to bottom, rgba(44,44,44,0.08), transparent)',
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
          boxShadow: `inset 0 1px 0 0 rgba(44,44,44,0.05)`,
          '&:hover': {
            background: designTokens.colors.surface.hover,
            boxShadow: `0 0 0 1px ${designTokens.colors.border.hover}, 0 2px 8px rgba(44,44,44,0.12), inset 0 1px 0 0 rgba(44,44,44,0.05)`,
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
            '& input[type=number]::-webkit-inner-spin-button': {
              '-webkit-appearance': 'none',
              margin: 0,
            },
            '& input[type=number]::-webkit-outer-spin-button': {
              '-webkit-appearance': 'none',
              margin: 0,
            },
            '& input[type=number]': {
              '-moz-appearance': 'textfield',
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
          background: designTokens.colors.background.elevated,
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

export default designTokens;
