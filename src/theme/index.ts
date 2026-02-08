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
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark';

/**
 * 设计令牌 - 颜色系统（竹林清风配色）
 * 浅色模式
 */
const lightDesignTokens = {
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
 * 设计令牌 - 颜色系统（竹林清风配色）
 * 暗色模式
 */
const darkDesignTokens = {
  colors: {
    background: {
      deep: '#1A1E1D',      // 深墨背景
      base: '#1F2423',      // 墨背景基础
      elevated: '#252B2A',  // 墨背景悬浮
    },
    surface: {
      default: 'rgba(255,255,255,0.06)',     // 浅表面
      hover: 'rgba(255,255,255,0.10)',        // 悬停浅表面
    },
    foreground: {
      primary: '#F0ECE5',     // 宣纸白
      muted: '#A8B0AF',       // 浅宣纸
      subtle: 'rgba(240,236,229,0.65)',  // 细腻宣纸色
    },
    accent: {
      primary: '#8FA398',     // 亮竹青
      bright: '#9FB5AA',      // 亮竹青高亮
      glow: 'rgba(143,163,152,0.35)',  // 竹青辉光
    },
    border: {
      default: 'rgba(255,255,255,0.10)',   // 浅边框
      hover: 'rgba(255,255,255,0.16)',     // 悬停浅边框
      accent: 'rgba(143,163,152,0.35)', // 竹青边框
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
 * 创建禅意主题（支持浅色/暗色模式）
 */
export const createZenTheme = (mode: ThemeMode = 'light') => {
  const tokens = mode === 'light' ? lightDesignTokens : darkDesignTokens;

  return createTheme({
    palette: {
      mode,
      background: {
        default: tokens.colors.background.base,
        paper: tokens.colors.background.elevated,
      },
      primary: {
        main: tokens.colors.accent.primary,
        light: tokens.colors.accent.bright,
      },
      text: {
        primary: tokens.colors.foreground.primary,
        secondary: tokens.colors.foreground.muted,
      },
      divider: tokens.colors.border.default,
    },
    typography: {
      fontFamily: tokens.typography.fontFamily,
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
      borderRadius: tokens.radius.md,
    },
    transitions: {
      duration: {
        shortest: tokens.animation.duration.fast,
        shorter: tokens.animation.duration.fast,
        short: tokens.animation.duration.normal,
        standard: tokens.animation.duration.normal,
        complex: tokens.animation.duration.slow,
      },
      easing: {
        sharp: tokens.animation.easing.expoOut,
        easeInOut: tokens.animation.easing.expoOut,
      },
    },
    shadows: [
      'none',
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.hover}, 0 4px 12px ${mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(44,44,44,0.12)'}, 0 12px 24px ${tokens.colors.accent.glow}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
      `0 0 0 1px ${tokens.colors.border.default}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(44,44,44,0.08)'}, 0 8px 16px ${mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(44,44,44,0.04)'}`,
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: tokens.colors.background.elevated,
            border: `1px solid ${tokens.colors.border.default}`,
            borderRadius: tokens.radius.lg,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: `linear-gradient(to bottom, ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,44,44,0.08)'}, transparent)`,
              borderRadius: `${tokens.radius.lg}px ${tokens.radius.lg}px 0 0`,
            },
            '&:hover': {
              borderColor: tokens.colors.border.hover,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: tokens.radius.sm,
            fontWeight: 500,
            transition: `all ${tokens.animation.duration.fast}ms ${tokens.animation.easing.expoOut}`,
            '&:active': {
              transform: 'scale(0.98)',
            },
          },
          contained: {
            background: tokens.colors.accent.primary,
            color: '#ffffff',
            boxShadow: `0 0 0 1px ${tokens.colors.accent.glow}, 0 4px 12px ${tokens.colors.accent.glow}, inset 0 1px 0 0 rgba(255,255,255,0.2)`,
            '&:hover': {
              background: tokens.colors.accent.bright,
              boxShadow: `0 0 0 1px ${tokens.colors.accent.glow}, 0 6px 20px ${tokens.colors.accent.glow}, inset 0 1px 0 0 rgba(255,255,255,0.3)`,
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            background: tokens.colors.surface.default,
            color: tokens.colors.foreground.primary,
            border: 'none',
            boxShadow: `inset 0 1px 0 0 ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.05)'}`,
            '&:hover': {
              background: tokens.colors.surface.hover,
              boxShadow: `0 0 0 1px ${tokens.colors.border.hover}, 0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(44,44,44,0.12)'}, inset 0 1px 0 0 ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.05)'}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: tokens.colors.background.elevated,
              '& fieldset': {
                borderColor: tokens.colors.border.default,
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: tokens.colors.border.hover,
              },
              '&.Mui-focused fieldset': {
                borderColor: tokens.colors.accent.primary,
                boxShadow: `0 0 0 2px ${tokens.colors.accent.glow}`,
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
              color: tokens.colors.foreground.muted,
              '&.Mui-focused': {
                color: tokens.colors.accent.primary,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: tokens.colors.background.elevated,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${tokens.colors.border.default}`,
            borderRadius: tokens.radius.lg,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase': {
              '&.Mui-checked': {
                color: tokens.colors.accent.primary,
              },
              '&.Mui-checked + .MuiSwitch-track': {
                backgroundColor: tokens.colors.accent.primary,
              },
            },
          },
        },
      },
    },
  });
};

export default lightDesignTokens;
