---
name: pomozen-wxt-migration
description: 将 PomoZen 番茄钟扩展迁移到 WXT 框架
type: project
---

# PomoZen WXT 迁移设计

## 1. 项目概述

- **项目名称**: PomoZen (竹林番茄钟)
- **项目类型**: Chrome 扩展程序
- **核心功能**: 融合中国传统美学的番茄工作法计时器
- **目标用户**: 需要专注工作的用户

## 2. 现有功能

- 专注计时（默认 25 分钟，可配置 1-120 分钟）
- 短休息（默认 5 分钟）
- 长休息（默认 30 分钟，4 轮后触发）
- 自动模式切换
- 自动开始下一轮
- 系统通知 + 声音提醒
- 设置页面（时长配置、开关设置）
- 统计数据（图表展示）

## 3. 技术迁移方案

### 3.1 构建工具迁移

| 对比项 | 现有 | WXT |
|--------|------|-----|
| 构建工具 | Vite + vite-plugin-chrome-extension | WXT 内置 |
| 类型定义 | 手动 @types/chrome.d.ts | WXT 内置 |
| 入口配置 | manifest.json 分散 | wxt.config.ts 集中 |
| HMR | 需手动刷新 | WXT 自动 |

### 3.2 目录结构变更

```
现有结构                    WXT 结构
├── src/                   ├── entrypoints/
│   ├── manifest.json      │   ├── popup/      → popup/index.html + main.tsx
│   ├── background.js     │   ├── background/ → background.ts
│   ├── popup/            │   └── options/    → options/index.html + main.tsx
│   │   ├── index.html    ├── components/    (共享组件)
│   │   └── main.tsx      ├── hooks/         (共享 hooks)
│   ├── settings/         ├── utils/         (工具函数)
│   │   ├── index.html    └── types/         (类型定义)
│   │   └── main.tsx      └── wxt.config.ts
│   ├── components/
│   ├── hooks/
│   └── utils/
├── vite.config.ts
└── package.json
```

### 3.3 核心迁移点

1. **manifest.json** → wxt.config.ts 的 `manifest` 配置
2. **background.js** → entrypoints/background/main.ts
3. **popup/main.tsx** → entrypoints/popup/main.tsx
4. **settings/main.tsx** → entrypoints/options/main.tsx
5. **共享组件/hooks** 移动到项目根目录

### 3.4 代码调整

- 移除 `@types/chrome.d.ts`（WXT 提供）
- 调整 import 路径（从 `src/` 改为相对路径或 alias）
- 移除 vite-plugin-chrome-extension 插件
- 更新 package.json scripts

## 4. 验收标准

- [ ] `npm run dev` 正常启动开发服务器
- [ ] `npm run build` 正常构建扩展
- [ ] 扩展可以正常加载到 Chrome
- [ ] Popup 计时器功能正常
- [ ] Settings 页面功能正常
- [ ] Background service worker 正常工作
- [ ] 通知功能正常

## 5. 实施步骤

1. 安装 WXT 依赖
2. 创建 wxt.config.ts 配置
3. 调整目录结构（src → entrypoints）
4. 迁移各入口文件
5. 迁移共享代码
6. 更新 package.json
7. 测试构建和运行