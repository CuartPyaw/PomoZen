/**
 * 应用入口文件
 *
 * 渲染番茄钟应用到 DOM，配置 MUI 主题
 *
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e53935',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// 创建并渲染根节点
// StrictMode 启用了额外的开发时检查以帮助捕获潜在问题
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
