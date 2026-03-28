# PomoZen WXT 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 PomoZen 番茄钟扩展从 Vite + vite-plugin-chrome-extension 迁移到 WXT 框架

**Architecture:** 保持现有功能不变，将构建工具从 Vite 替换为 WXT，目录结构从 src/ 调整为 WXT 默认的 entrypoints/ 结构

**Tech Stack:** WXT, React 18, TypeScript, MUI, Chart.js

---

## 文件结构规划

```
PomoZen-extension/
├── entrypoints/              (WXT 入口目录)
│   ├── popup/
│   │   ├── main.tsx         (迁移自 src/popup/main.tsx)
│   │   └── index.html      (迁移自 src/popup/index.html)
│   ├── background/
│   │   └── main.ts         (迁移自 src/background.js)
│   └── options/
│       ├── main.tsx        (迁移自 src/settings/main.tsx)
│       └── index.html     (迁移自 src/settings/index.html)
├── components/              (共享组件，迁移自 src/components)
├── hooks/                   (共享 hooks，迁移自 src/hooks)
├── utils/                   (工具函数，迁移自 src/utils)
├── types/                   (类型定义，迁移自 src/types)
├── theme/                   (主题配置，迁移自 src/theme)
├── styles/                  (样式文件，迁移自 src/styles)
├── wxt.config.ts            (新建，WXT 配置)
├── package.json             (修改，依赖调整)
└── tsconfig.json            (修改，路径配置)
```

---

## 实施任务

### Task 1: 安装 WXT 依赖并创建配置文件

**Files:**
- Modify: `package.json`
- Create: `wxt.config.ts`

- [ ] **Step 1: 安装 WXT**

```bash
npm install -D wxt
```

- [ ] **Step 2: 修改 package.json scripts**

将:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

改为:
```json
"scripts": {
  "dev": "wxt",
  "build": "wxt build",
  "preview": "wxt preview"
}
```

- [ ] **Step 3: 创建 wxt.config.ts**

```typescript
import { defineConfig } from 'wxt';
import { resolve } from 'path';

export default defineConfig({
  manifest: {
    name: 'PomoZen - 竹林番茄钟',
    version: '1.0.0',
    description: '融合中国传统美学与现代技术的番茄工作法计时器',
    permissions: ['storage', 'alarms', 'notifications'],
    action: {
      default_popup: 'popup/index.html',
    },
    options_page: 'options/index.html',
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 4: 提交**

```bash
git add package.json wxt.config.ts
git commit -m "chore: 安装 WXT 并创建配置"
```

---

### Task 2: 创建 entrypoints 目录结构和入口文件

**Files:**
- Create: `entrypoints/popup/index.html`
- Create: `entrypoints/popup/main.tsx`
- Create: `entrypoints/background/main.ts`
- Create: `entrypoints/options/index.html`
- Create: `entrypoints/options/main.tsx`

- [ ] **Step 1: 创建 popup/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PomoZen</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建 popup/main.tsx**

复制 `src/popup/main.tsx` 内容，修改:
- 移除顶部 import 的 `createRoot`（保留使用）
- 确保 React 从 'react' 导入

- [ ] **Step 3: 创建 background/main.ts**

复制 `src/background.js` 内容:
- 将文件改为 `.ts` 后缀
- 添加类型标注（如果需要）
- `chrome.*` API WXT 已内置类型定义

- [ ] **Step 4: 创建 options/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PomoZen 设置</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 options/main.tsx**

复制 `src/settings/main.tsx` 内容

- [ ] **Step 6: 提交**

```bash
git add entrypoints/
git commit -m "feat: 创建 entrypoints 目录结构"
```

---

### Task 3: 迁移共享代码

**Files:**
- Create: `components/` 目录及文件
- Create: `hooks/` 目录及文件
- Create: `utils/` 目录及文件
- Create: `types/` 目录及文件
- Create: `theme/` 目录及文件
- Create: `styles/` 目录及文件
- Create: `App.tsx`, `App.css`, `index.css`

- [ ] **Step 1: 迁移 components/**

复制以下文件:
- `src/components/Charts/` → `components/Charts/`
- `src/components/FocusCharts.tsx` → `components/FocusCharts.tsx`
- `src/components/GlassCard/` → `components/GlassCard/`
- `src/components/TimerPanel/` → `components/TimerPanel/`

- [ ] **Step 2: 迁移 hooks/**

复制以下文件:
- `src/hooks/useNotifications.ts`
- `src/hooks/useSettings.ts`
- `src/hooks/useStatistics.ts`
- `src/hooks/useTasks.ts`
- `src/hooks/useTaskStatistics.ts`
- `src/hooks/useTheme.ts`
- `src/hooks/useTimer.ts`

- [ ] **Step 3: 迁移 utils/**

复制以下文件:
- `src/utils/audioPlayer.ts`
- `src/utils/logger.ts`
- `src/utils/storage.ts`

- [ ] **Step 4: 迁移 types/**

复制以下文件:
- `src/types/errors.ts`
- `src/types/statistics.ts`
- `src/types/task.ts`
- `src/types/worker.ts`

- [ ] **Step 5: 迁移 theme/**

复制:
- `src/theme/index.ts`

- [ ] **Step 6: 迁移 styles/**

复制:
- `src/styles/background.css`

- [ ] **Step 7: 迁移根目录文件**

复制:
- `src/App.tsx` → `App.tsx`
- `src/App.css` → `App.css`
- `src/index.css` → `index.css`
- `src/SettingsPage.tsx` → `SettingsPage.tsx`

- [ ] **Step 8: 提交**

```bash
git add components/ hooks/ utils/ types/ theme/ styles/ App.tsx App.css index.css SettingsPage.tsx
git commit -m "feat: 迁移共享代码到根目录"
```

---

### Task 4: 复制静态资源

**Files:**
- Create: `public/` 目录

- [ ] **Step 1: 复制 icons 目录**

将 `src/icons/` 复制到项目根目录（wxt 会自动处理）

- [ ] **Step 2: 提交**

```bash
git add icons/
git commit -m "feat: 复制图标资源"
```

---

### Task 5: 更新 TypeScript 配置

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: 更新 tsconfig.json**

确保配置支持 WXT:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["entrypoints", "components", "hooks", "utils", "types", "theme", "App.tsx", "SettingsPage.tsx"]
}
```

- [ ] **Step 2: 提交**

```bash
git add tsconfig.json
git commit -m "chore: 更新 TypeScript 配置"
```

---

### Task 6: 验证构建

**Files:**
- N/A

- [ ] **Step 1: 运行 dev 服务器**

```bash
npm run dev
```

预期: 启动成功，可在 Chrome 加载扩展

- [ ] **Step 2: 运行 build**

```bash
npm run build
```

预期: 构建成功，输出到 `.output/` 目录

- [ ] **Step 3: 提交**

```bash
git commit -m "chore: 验证 WXT 构建成功"
```

---

### Task 7: 清理旧文件

**Files:**
- Delete: `src/` 目录（旧代码）
- Delete: `vite.config.ts`
- Delete: `dist/` 目录

- [ ] **Step 1: 删除旧文件**

```bash
rm -rf src/ dist/
rm vite.config.ts
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "refactor: 删除旧 Vite 配置和 src 目录"
```

---

## 验证清单

- [ ] `npm run dev` 正常启动开发服务器
- [ ] `npm run build` 正常构建扩展
- [ ] 扩展可以正常加载到 Chrome
- [ ] Popup 计时器功能正常
- [ ] Settings 页面功能正常
- [ ] Background service worker 正常工作
- [ ] 通知功能正常