/**
 * 应用入口文件
 *
 * 渲染番茄钟应用到 DOM
 *
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 创建并渲染根节点
// StrictMode 启用了额外的开发时检查以帮助捕获潜在问题
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
