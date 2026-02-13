# 玻璃态背景统一设计文档

**日期**: 2026-02-13
**状态**: 已批准
**作者**: Claude Code

## 概述

统一任务面板和计时器面板的背景视觉效果，创建共享的 `GlassCard` 组件实现一致的玻璃态效果和鼠标聚光灯交互。

## 问题背景

当前 `TaskPanel` 使用默认的 MUI `Card` 组件（实心背景），而右侧计时器区域的卡片（快捷键、统计、运行状态）使用半透明玻璃态效果，导致视觉层次不一致。

### 视觉差异对比

| 组件 | 当前背景 | 遮挡背景光斑 |
|------|----------|-------------|
| TaskPanel | 实心背景 (`background.paper`) | 完全遮挡 |
| 其他卡片 | 半透明 + `blur(10px)` | 部分透出 |

## 设计方案

### 核心思路

创建可复用的 `GlassCard` 组件，封装玻璃态样式和聚光灯效果，统一应用到 TaskPanel 和其他需要的地方。

### 架构设计

```
src/components/
├── GlassCard/
│   ├── GlassCard.tsx       # 主组件
│   └── index.ts            # 导出入口
├── TaskPanel/
│   └── TaskPanel.tsx       # 使用 GlassCard
└── TimerPanel/
    └── ActiveTaskCard.tsx  # 保持高亮效果（不修改）
```

## 组件 API

### GlassCard Props

```typescript
interface GlassCardProps extends CardProps {
  // 透明度级别（可选，默认 'medium'）
  glassIntensity?: 'subtle' | 'medium' | 'strong';

  // 是否启用聚光灯效果（可选，默认 true）
  enableSpotlight?: boolean;
}
```

### 透明度级别配置

| 级别 | 亮色模式背景 | 暗色模式背景 | 用途 |
|------|-------------|-------------|------|
| `subtle` | `rgba(44,44,44,0.02)` | `rgba(255,255,255,0.03)` | 轻微玻璃态 |
| `medium` | `rgba(44,44,44,0.05)` | `rgba(255,255,255,0.08)` | 标准玻璃态（默认） |
| `strong` | `rgba(44,44,44,0.08)` | `rgba(255,255,255,0.12)` | 强烈玻璃态 |

## 样式实现

### 核心样式属性

```tsx
const glassStyles = (theme: Theme, intensity: GlassIntensity) => ({
  // 玻璃态背景
  bgcolor: theme.palette.mode === 'dark'
    ? BG_INTENSITY_DARK[intensity]
    : BG_INTENSITY_LIGHT[intensity],

  // 背景模糊
  backdropFilter: 'blur(10px)',

  // 边框
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(44,44,44,0.08)',

  // 聚光灯效果定位
  position: 'relative',
  overflow: 'hidden',
});
```

### 聚光灯效果

利用现有的 `.card-spotlight` CSS 类（定义在 `src/styles/background.css`），通过鼠标事件更新 CSS 变量：

```tsx
const handleMouseMove = (e: React.MouseEvent) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  card.style.setProperty('--mouse-x', `${x}%`);
  card.style.setProperty('--mouse-y', `${y}%`);
};
```

## 集成计划

### 主要修改文件

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `src/components/GlassCard/GlassCard.tsx` | 新建 | GlassCard 组件 |
| `src/components/GlassCard/index.ts` | 新建 | 导出入口 |
| `src/components/TaskPanel/TaskPanel.tsx` | 修改 | 用 `GlassCard` 替换 `Card` |
| `src/App.tsx` | 修改 | 更新导入路径 |

### TaskPanel 修改示例

```tsx
// 修改前
import { Card } from '@mui/material';
// ...
<Card sx={{ height: '100%', display: 'flex', ... }}>

// 修改后
import { GlassCard } from '../GlassCard';
// ...
<GlassCard glassIntensity="medium" sx={{ height: '100%', display: 'flex', ... }}>
```

### 保持不变

`ActiveTaskCard` 保持当前的高亮效果（`backgroundColor: 'action.hover'`），不修改为玻璃态，以区分"已关联任务"的特殊状态。

## 实现要点

1. **鼠标跟踪优化**: 使用 `useRef` 缓存 DOM 引用，`useCallback` 包装事件处理
2. **降级处理**: `backdrop-filter` 不支持的环境回退到纯半透明背景
3. **可访问性**: 遵守 `prefers-reduced-motion` 用户偏好（现有 CSS 已处理）
4. **类型安全**: 扩展 `CardProps` 确保所有 MUI Card 功能可用

## 预期效果

- TaskPanel 与其他卡片视觉风格统一
- 半透明背景允许动态光斑透出
- 鼠标悬停时呈现聚光灯高亮效果
- 易于维护和扩展

## 设计决策记录

| 决策 | 原因 |
|------|------|
| 创建共享组件而非直接复制样式 | DRY 原则，便于统一维护 |
| 支持三档透明度配置 | 适应不同场景需求 |
| 保持 ActiveTaskCard 高亮效果 | 区分"已关联任务"的特殊状态 |
| 利用现有 CSS 类 `.card-spotlight` | 复用已有样式，减少重复 |
