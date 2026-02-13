# GlassCard 组件实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建可复用的 GlassCard 组件，统一 TaskPanel 和其他卡片的玻璃态视觉效果

**Architecture:** 创建共享的 GlassCard 组件，封装玻璃态样式（半透明背景 + 背景模糊）和鼠标聚光灯效果，通过 MUI Card props 扩展实现无缝集成

**Tech Stack:** React, TypeScript, MUI (Material-UI), CSS-in-JS (sx prop), CSS Variables

---

## Task 1: 创建 GlassCard 组件目录和导出文件

**Files:**
- Create: `src/components/GlassCard/index.ts`

**Step 1: 创建导出文件**

Write: `src/components/GlassCard/index.ts`

```typescript
export { GlassCard } from './GlassCard';
export type { GlassCardProps, GlassIntensity } from './GlassCard';
```

**Step 2: Commit**

```bash
git add src/components/GlassCard/index.ts
git commit -m "feat(glass-card): create GlassCard module structure"
```

---

## Task 2: 实现 GlassCard 组件核心

**Files:**
- Create: `src/components/GlassCard/GlassCard.tsx`

**Step 1: 定义类型和常量**

Write: `src/components/GlassCard/GlassCard.tsx`

```typescript
import React, { useRef, useCallback, useEffect } from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { useTheme as useThemeMode } from '../../hooks/useTheme';

/** 透明度级别类型 */
export type GlassIntensity = 'subtle' | 'medium' | 'strong';

/** 透明度级别配置 - 亮色模式 */
const BG_INTENSITY_LIGHT: Record<GlassIntensity, string> = {
  subtle: 'rgba(44,44,44,0.02)',
  medium: 'rgba(44,44,44,0.05)',
  strong: 'rgba(44,44,44,0.08)',
};

/** 透明度级别配置 - 暗色模式 */
const BG_INTENSITY_DARK: Record<GlassIntensity, string> = {
  subtle: 'rgba(255,255,255,0.03)',
  medium: 'rgba(255,255,255,0.08)',
  strong: 'rgba(255,255,255,0.12)',
};
```

**Step 2: 定义 Props 接口**

Continue writing `src/components/GlassCard/GlassCard.tsx`

```typescript
export interface GlassCardProps extends Omit<CardProps, 'classes'> {
  /** 透明度级别（可选，默认 'medium'） */
  glassIntensity?: GlassIntensity;
  /** 是否启用聚光灯效果（可选，默认 true） */
  enableSpotlight?: boolean;
}
```

**Step 3: 实现组件主体**

Continue writing `src/components/GlassCard/GlassCard.tsx`

```typescript
/**
 * 玻璃态卡片组件
 *
 * 提供半透明背景 + 背景模糊 + 鼠标聚光灯效果
 * 封装统一的中国禅意设计系统玻璃态风格
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  glassIntensity = 'medium',
  enableSpotlight = true,
  children,
  onMouseMove,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const { themeMode } = useThemeMode();
  const cardRef = useRef<HTMLDivElement>(null);

  // 鼠标移动处理 - 更新聚光灯位置 CSS 变量
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  // 处理鼠标移动事件
  const handleMouseMoveWrapper = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    if (onMouseMove) {
      onMouseMove(e);
    }
  }, [handleMouseMove, onMouseMove]);

  // 构建玻璃态样式
  const glassSx = {
    // 玻璃态背景
    bgcolor: themeMode === 'dark'
      ? BG_INTENSITY_DARK[glassIntensity]
      : BG_INTENSITY_LIGHT[glassIntensity],
    // 背景模糊
    backdropFilter: 'blur(10px)',
    // 边框
    border: themeMode === 'dark'
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(44,44,44,0.08)',
    // 聚光灯效果定位
    position: 'relative' as const,
    overflow: 'hidden' as const,
    // 合并用户传入的样式
    ...sx,
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={enableSpotlight ? handleMouseMoveWrapper : onMouseMove}
      sx={glassSx}
      {...props}
    >
      {enableSpotlight && (
        <div
          className="card-spotlight"
          style={{
            // 确保聚光灯使用卡片根节点的 CSS 变量
            ['--mouse-x' as string]: 'var(--mouse-x, 50%)',
            ['--mouse-y' as string]: 'var(--mouse-y, 50%)',
          }}
        />
      )}
      {children}
    </Card>
  );
};
```

**Step 4: Commit**

```bash
git add src/components/GlassCard/GlassCard.tsx
git commit -m "feat(glass-card): implement GlassCard component with intensity levels and spotlight effect"
```

---

## Task 3: 更新 TaskPanel 使用 GlassCard

**Files:**
- Modify: `src/components/TaskPanel/TaskPanel.tsx:9,16,109-116`

**Step 1: 更新导入语句**

Modify: `src/components/TaskPanel/TaskPanel.tsx` (Line 9-16)

将:
```typescript
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { TaskList } from './TaskList';
```

改为:
```typescript
import {
  Box,
  CardContent,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { GlassCard } from '../GlassCard';
import { TaskList } from './TaskList';
```

**Step 2: 替换 Card 为 GlassCard**

Modify: `src/components/TaskPanel/TaskPanel.tsx` (Line 109-116)

将:
```typescript
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
```

改为:
```typescript
  return (
    <GlassCard
      glassIntensity="medium"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
```

**Step 3: 更新闭合标签**

Modify: `src/components/TaskPanel/TaskPanel.tsx` (Line 181)

将:
```typescript
    </Card>
```

改为:
```typescript
    </GlassCard>
```

**Step 4: 手动验证 - 检查 TaskPanel 视觉效果**

Run: 打开浏览器 http://localhost:5173
Expected: TaskPanel 现在呈现半透明背景，可以透出背后的动态光斑

**Step 5: Commit**

```bash
git add src/components/TaskPanel/TaskPanel.tsx
git commit -m "refactor(task-panel): use GlassCard component for consistent glassmorphism style"
```

---

## Task 4: 可选优化 - 其他卡片也使用 GlassCard

**Files:**
- Modify: `src/App.tsx:606,622-629,676`

**Step 1: 导入 GlassCard**

Modify: `src/App.tsx` (约 Line 67-68)

在导入区域添加:
```typescript
import { GlassCard } from './components/GlassCard';
```

**Step 2: 替换快捷键提示卡片为 GlassCard**

Modify: `src/App.tsx` (Line 606)

将:
```typescript
              <Card elevation={0} sx={{ borderRadius: 4, bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)', backdropFilter: 'blur(10px)', border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)', flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
```

改为:
```typescript
              <GlassCard glassIntensity="medium" sx={{ borderRadius: 4, flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
```

**Step 3: 替换统计卡片为 GlassCard**

Modify: `src/App.tsx` (Line 622-629)

将:
```typescript
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)',
                  flex: 1,
                  minWidth: { xs: '100%', sm: '200px' },
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
                    transform: 'translateY(-2px)',
                  }
                }}
```

改为:
```typescript
              <GlassCard
                glassIntensity="medium"
                sx={{
                  borderRadius: 4,
                  flex: 1,
                  minWidth: { xs: '100%', sm: '200px' },
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
                    transform: 'translateY(-2px)',
                  }
                }}
```

**Step 4: 替换运行状态卡片为 GlassCard**

Modify: `src/App.tsx` (Line 676)

将:
```typescript
              <Card elevation={0} sx={{ borderRadius: 4, bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,44,44,0.03)', backdropFilter: 'blur(10px)', border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(44,44,44,0.08)', flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
```

改为:
```typescript
              <GlassCard glassIntensity="medium" sx={{ borderRadius: 4, flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
```

**Step 5: 更新对应的闭合标签**

找到这三个 Card 的闭合标签 `</Card>`，全部改为 `</GlassCard>`

**Step 6: 手动验证 - 检查所有卡片视觉一致性**

Run: 刷新浏览器
Expected: 所有卡片呈现统一的玻璃态效果

**Step 7: Commit**

```bash
git add src/App.tsx
git commit - "refactor(app): replace hardcoded glassmorphism cards with GlassCard component"
```

---

## Task 5: 暗色模式聚光灯颜色修复（可选）

**Files:**
- Modify: `src/styles/background.css` (添加暗色模式聚光灯效果)

**Step 1: 检查暗色模式聚光灯是否存在**

Read: `src/styles/background.css` (Line 270-338)

确认是否有暗色模式的聚光灯样式。如果没有，需要在暗色模式部分添加：

**Step 2: 添加暗色模式聚光灯效果（如需要）**

在暗色模式样式区域（Line 270+）添加:

```css
/* 暗色模式卡片聚光灯效果 */
[data-theme="dark"] .card-spotlight {
  background: radial-gradient(
    300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(143, 163, 152, 0.10),
    transparent
  );
}
```

**Step 3: 验证暗色模式效果**

Run: 切换到暗色模式，检查聚光灯效果

**Step 4: Commit**

```bash
git add src/styles/background.css
git commit -m "fix(background): add dark mode spotlight color"
```

---

## Task 6: 类型检查和构建验证

**Step 1: TypeScript 类型检查**

Run: `npm run build`

Expected: 构建成功，无类型错误

**Step 2: 开发服务器验证**

Run: `npm run dev`

Expected: 开发服务器启动，应用正常运行

**Step 3: 人工测试检查清单**

- [ ] TaskPanel 显示半透明背景
- [ ] TaskPanel 背后光斑可以透出
- [ ] 鼠标悬停 TaskPanel 时有聚光灯效果
- [ ] 切换暗色模式效果正常
- [ ] 快捷键/统计/运行状态卡片使用 GlassCard（如果完成了 Task 4）
- [ ] ActiveTaskCard 保持高亮效果不变

**Step 4: 最终 commit（如有必要）**

如果类型检查或构建过程中发现问题，修复后提交。

---

## 验收标准

1. **视觉统一**: TaskPanel 与其他卡片玻璃态效果一致
2. **背景透光**: 半透明背景允许动态光斑透出
3. **交互效果**: 鼠标悬停时聚光灯效果平滑跟随
4. **主题适配**: 亮色/暗色模式切换正常
5. **代码质量**: TypeScript 类型检查通过，构建无错误

## 相关文档

- 设计文档: `docs/plans/2026-02-13-glass-card-design.md`
- 背景样式: `src/styles/background.css`
- MUI Card 文档: https://mui.com/material-ui/react-card/
