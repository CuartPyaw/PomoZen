<div align="center">
  <img src="public/favicon.svg" width="120" alt="PomoZen Logo" />
  <h1>PomoZen</h1>
  <p><b>竹林清风 — 禅意番茄钟</b></p>
  <p>融合中国传统美学与现代技术的番茄工作法计时器</p>

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

PomoZen 是一款融合中国传统「竹林清风」美学意境的番茄工作法计时器。摒弃繁杂 UI 干扰，专注于沉浸式专注体验。计时器运行于 Web Worker 线程，确保计时精准不受浏览器节流影响。所有数据存储于本地，隐私无忧。

## ✨ 核心特性

- ⏱️ **精准计时**：基于 Web Worker 的计时器，不受浏览器节流或标签页切换影响
- 🎨 **禅意主题**：竹林清风配色方案（竹青、宣纸白、墨黑），支持亮色/暗色/自动切换
- 📊 **统计仪表板**：可视化专注历史，包含折线图、柱状图和时间分布热力图
- 🔔 **智能提醒**：桌面通知 + 声音提醒，支持自动跳过已完成通知
- ⚙️ **灵活配置**：自定义专注/休息时长，自动切换、自动开始等选项
- 💾 **本地持久化**：所有设置和统计数据存储于 localStorage，刷新不丢失
- 🌙 **平滑动画**：多层级环境背景，禅意光影效果，尊重用户动画偏好设置
- 🚀 **多种部署**：支持 Vercel、Docker、静态托管等多种部署方式

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **核心框架** | React 18.3.1 + TypeScript 5.7.2 |
| **构建工具** | Vite 6.0.3 |
| **UI 组件** | Material-UI 7.3.7 + Emotion |
| **图表库** | Recharts 3.7.0 + Chart.js 4.5.1 |
| **图标** | @mui/icons-material 7.3.7 |
| **部署** | Vercel, Docker + Nginx |

## 📂 目录结构

```
PomoZen/
├── src/
│   ├── components/                   # React 组件
│   │   ├── Charts/                   # 统计图表组件
│   │   │   ├── ChartContainer.tsx    # 通用图表包装器
│   │   │   ├── DailyLineChart.tsx    # 每日专注时长折线图
│   │   │   ├── WeeklyBarChart.tsx    # 每周专注次数柱状图
│   │   │   ├── MonthlyLineChart.tsx  # 每月专注趋势图
│   │   │   └── TimeDistributionHeatmap.tsx  # 时间分布热力图
│   │   └── FocusCharts.tsx           # 统计仪表板主组件
│   ├── hooks/                        # 自定义 React Hooks
│   │   ├── useTimer.ts               # 计时器核心逻辑
│   │   ├── useSettings.ts            # 设置管理
│   │   ├── useStatistics.ts          # 统计数据聚合
│   │   ├── useTheme.ts               # 主题切换
│   │   └── useNotifications.ts       # 浏览器通知处理
│   ├── utils/                        # 工具函数
│   │   ├── storage.ts                # localStorage 封装
│   │   ├── logger.ts                 # 日志系统
│   │   └── audioPlayer.ts            # 音频播放器
│   ├── types/                        # TypeScript 类型定义
│   │   ├── worker.ts                 # Web Worker 通信类型
│   │   ├── statistics.ts             # 统计数据类型
│   │   └── errors.ts                 # 自定义错误类型
│   ├── theme/                        # 主题配置
│   │   └── index.ts                  # 禅意主题配置
│   ├── styles/                       # 样式文件
│   │   └── background.css            # 多层环境背景动画
│   ├── workers/                      # Web Workers
│   │   └── timerWorker.ts            # 计时器逻辑（独立线程）
│   ├── @types/                       # 自定义类型声明
│   ├── App.tsx                       # 主应用组件
│   ├── App.css                       # 组件特定样式
│   ├── index.css                     # 全局 CSS 重置
│   └── main.tsx                      # 应用入口点
├── public/                           # 静态资源
│   ├── favicon.svg                   # 网站图标
│   └── apple-touch-icon.svg          # Apple 设备图标
├── CLAUDE.md                         # 开发指南
├── CHANGELOG.md                      # 版本更新记录
├── Dockerfile                        # Docker 镜像构建
├── docker-compose.yml                # Docker Compose 配置
├── nginx.conf                        # Nginx 服务器配置
├── vite.config.ts                    # Vite 构建配置
└── tsconfig.json                     # TypeScript 配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- npm >= 9.0

### 安装运行

```bash
# 1. 克隆项目
git clone https://github.com/CuartPyaw/pomozen.git

# 2. 进入目录
cd pomozen

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📦 部署

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CuartPyaw/pomozen)

### Docker

```bash
# 使用 Docker Compose
docker-compose up -d

# 或手动构建
docker build -t pomozen .
docker run -d -p 8080:80 --name pomozen pomozen
```

## 🗺️ 开发路线图

- [x] **核心功能**：三种计时模式、Web Worker 计时器、状态持久化
- [x] **禅意主题**：竹林清风配色、亮色/暗色模式、环境背景动画
- [x] **统计功能**：每日/每周/每月统计、时间分布热力图
- [x] **通知系统**：桌面通知、声音提醒、自动跳过
- [ ] **PWA 支持**：离线使用、桌面安装
- [ ] **云端同步**：跨设备数据同步

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
- [Linear](https://linear.app) 设计灵感
- 基于 [React](https://react.dev)、[Vite](https://vitejs.dev) 和 [Material-UI](https://mui.com) 构建
