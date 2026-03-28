<div align="center">
  <img src="public/favicon.svg" width="120" alt="PomoZen Logo" />
  <h1>PomoZen</h1>
  <p><b>竹林清风 — 禅意番茄钟</b></p>
  <p>融合中国传统美学与现代技术的 Chrome 番茄工作法计时器插件</p>

  <p>
    <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square" />
    <img src="https://img.shields.io/badge/React-18.3.1-61dafb?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-5.7.2-3178c6?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/Vite-6.0.3-646cff?style=flat-square&logo=vite" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
  </p>
</div>

<br />

<div align="center">
  <a href="https://github.com/CuartPyaw/pomozen"><strong>🌐 GitHub 仓库</strong></a> &nbsp;•&nbsp;
  <a href="#快速开始"><strong>🚀 快速开始</strong></a> &nbsp;•&nbsp;
  <a href="#核心特性"><strong>✨ 核心特性</strong></a>
</div>

<br />

PomoZen 是一款融合中国传统「竹林清风」美学意境的 Chrome 番茄工作法计时器插件。摒弃繁杂 UI 干扰，专注于沉浸式专注体验。计时器运行于 Chrome 后台服务 worker，确保计时精准不受浏览器节流影响。所有数据存储于云端，登录 Chrome 账号即可跨设备同步。

## ✨ 核心特性

- ⏱️ **精准计时**：基于 Chrome alarms 的后台计时器，不受浏览器节流或标签页切换影响
- 🎨 **禅意主题**：竹林清风配色方案（竹青、宣纸白、墨黑），支持亮色/暗色切换
- 📊 **统计仪表板**：可视化专注历史，包含折线图、柱状图和时间分布热力图
- 🔔 **智能提醒**：系统桌面通知 + 声音提醒
- ⚙️ **灵活配置**：自定义专注/休息时长，自动切换、自动开始等选项
- 💾 **云端同步**：chrome.storage.sync 实现跨设备数据同步
- 🚀 **快捷入口**：点击工具栏图标快速启动计时器

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **核心框架** | React 18.3.1 + TypeScript 5.7.2 |
| **构建工具** | Vite 6.0.3 + vite-plugin-chrome-extension |
| **UI 组件** | Material-UI 7.3.7 + Emotion |
| **图表库** | Recharts 3.7.0 + Chart.js 4.5.1 |
| **图标** | @mui/icons-material 7.3.7 |
| **扩展 API** | Chrome Extension Manifest V3 |

## 📂 目录结构

```
PomoZen/
├── src/
│   ├── manifest.json           # Chrome 扩展配置文件
│   ├── background.js           # 后台服务 worker
│   ├── popup/                  # Popup 入口
│   │   ├── index.html
│   │   └── main.tsx            # Popup 主组件
│   ├── settings/               # 设置页面入口
│   │   ├── index.html
│   │   └── main.tsx            # 设置页面主组件
│   ├── hooks/                  # React Hooks
│   │   ├── useTimer.ts         # 计时器核心逻辑
│   │   ├── useSettings.ts      # 设置管理
│   │   ├── useStatistics.ts    # 统计数据聚合
│   │   ├── useTheme.ts         # 主题切换
│   │   └── useNotifications.ts # 浏览器通知处理
│   ├── utils/                  # 工具函数
│   │   ├── storage.ts          # chrome.storage 封装
│   │   ├── logger.ts           # 日志系统
│   │   └── audioPlayer.ts      # 音频播放器
│   ├── types/                  # TypeScript 类型定义
│   ├── theme/                  # 主题配置
│   ├── styles/                 # 样式文件
│   └── @types/                 # 类型声明
├── public/                     # 静态资源
├── dist/                       # 构建输出目录
├── vite.config.ts              # Vite 构建配置
└── package.json                # 项目配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- npm >= 9.0
- Chrome 浏览器 >= 88

### 安装运行

```bash
# 1. 克隆项目
git clone https://github.com/CuartPyaw/pomozen.git

# 2. 进入目录
cd pomozen

# 3. 安装依赖
npm install

# 4. 构建 Chrome 扩展
npm run build
```

### 加载扩展

1. 打开 Chrome 扩展管理页面：`chrome://extensions/`
2. 启用「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 `dist/` 目录

## 🔧 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
```

## 📦 发布到 Chrome Web Store

1. 构建生产版本：`npm run build`
2. 打包 `dist/` 目录为 ZIP 文件
3. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. 上传 ZIP 文件并填写应用信息

## 🗺️ 开发路线图

- [x] **核心功能**：三种计时模式、chrome.alarms 计时器、状态持久化
- [x] **禅意主题**：竹林清风配色、亮色/暗色模式
- [x] **统计功能**：每日/每周/每月统计、时间分布热力图
- [x] **通知系统**：chrome.notifications 桌面通知、声音提醒
- [x] **云端同步**：chrome.storage.sync 跨设备数据同步
- [ ] **PWA 支持**：离线使用
- [ ] **快捷键**：全局键盘快捷键

## 🤝 贡献指南

我们欢迎社区贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

## 🙏 致谢

- [Pomodoro Technique](https://cirillocompany.com/pages/pomodoro-technique) by Francesco Cirillo
- 基于 [React](https://react.dev)、[Vite](https://vitejs.dev) 和 [Material-UI](https://mui.com) 构建