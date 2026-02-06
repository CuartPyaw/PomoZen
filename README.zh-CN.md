# PomoZen

[![English](https://img.shields.io/badge/lang-English-blue.svg)](README.md) [![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](README.zh-CN.md)

> 一个具有 Linear 风格设计美学的现代番茄钟应用（Pomodoro Zen）。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 功能特性

- **三种计时模式**: 专注（25分钟）、短休息（5分钟）、长休息（30分钟）
- **Web Worker 计时器**: 精确倒计时，不受浏览器节流或标签页焦点影响
- **自动切换**: 自动推进番茄工作周期
- **桌面通知**: 计时结束时浏览器原生提醒
- **统计面板**: 使用交互式图表可视化专注历史
- **状态持久化**: 计时器状态和设置保存到本地存储
- **深色主题**: 现代 Linear 风格美学，带动态背景
- **多种部署方式**: 支持 Vercel、Docker 和静态托管

---

## 技术栈

| 类别 | 技术 |
|----------|------------|
| **框架** | React 18.3.1 + TypeScript |
| **构建工具** | Vite 6.0.3 |
| **UI 库** | Material-UI (MUI) 7.3.7 |
| **图表** | Recharts 3.7.0, Chart.js 4.5.1 |
| **样式** | Emotion (CSS-in-JS) + 自定义 CSS |
| **部署** | Vercel, Docker + Nginx |

---

## 项目结构

```
pomozen/
├── src/
│   ├── components/
│   │   └── Charts/                 # 统计图表组件
│   ├── styles/
│   │   └── background.css          # 动态渐变背景
│   ├── theme/
│   │   └── index.ts                # MUI 深色主题配置
│   ├── types/
│   │   ├── statistics.ts           # 统计类型定义
│   │   └── worker.ts               # Web Worker 通信类型
│   ├── workers/
│   │   └── timerWorker.ts          # Web Worker 中的计时器逻辑
│   ├── App.tsx                     # 主应用组件（约 2200 行）
│   ├── App.css                     # 组件特定样式
│   ├── index.css                   # 全局 CSS 重置
│   └── main.tsx                    # 应用入口
├── public/                         # 静态资源
├── Dockerfile                      # Docker 镜像构建
├── docker-compose.yml              # Docker Compose 配置
├── nginx.conf                      # Nginx 服务器配置
└── vite.config.ts                  # Vite 构建配置
```

---

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/CuartPyaw/pomozen.git
cd pomozen

# 安装依赖
npm ci
```

### 开发

```bash
# 启动开发服务器（支持热模块替换）
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 生产构建

```bash
# 构建生产版本（TypeScript 检查 + Vite 构建）
npm run build

# 本地预览生产构建
npm run preview
```

---

## 部署

### 选项 1：Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CuartPyaw/pomozen)

#### 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
vercel
```

按照提示完成部署。Vercel 会自动检测你的 Vite + React 项目配置。

**部署到生产环境：**
```bash
vercel --prod
```

#### 使用 Vercel 控制台

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com) 并点击 "Add New" → "Project"
3. 导入你的仓库
4. 点击 "Deploy"

Vercel 会自动配置：
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite

#### 可选：创建 vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite"
}
```

---

### 选项 2：Docker

#### 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 手动 Docker 构建

```bash
# 构建镜像
docker build -t pomozen .

# 运行容器
docker run -d -p 8080:80 --name pomozen pomozen
```

容器启动后访问 `http://localhost:8080`。

---

### 选项 3：静态托管

构建项目后，你可以将 `dist/` 文件夹部署到任何静态托管服务：

- **Netlify**: 直接拖放 `dist/` 文件夹
- **GitHub Pages**: 推送到 `gh-pages` 分支
- **AWS S3 + CloudFront**: 上传到 S3 存储桶
- **Firebase Hosting**: `firebase init` + `firebase deploy`

---

## 使用方法

### 计时器模式

1. **专注模式**（默认 25 分钟）：专注于工作
2. **短休息**（默认 5 分钟）：专注时段之间的休息
3. **长休息**（默认 30 分钟）：完成 5 个专注时段后的长休息

### 控制按钮

- **播放/暂停**: 启动或暂停当前计时器
- **重置**: 将当前计时器重置为初始时长
- **跳到下一个**: 手动推进到下一个模式
- **设置**: 自定义时长和切换功能

### 设置选项

| 设置 | 描述 |
|---------|-------------|
| 自定义时长 | 为每个模式设置自定义时间（分钟） |
| 自动切换 | 完成后自动进入下一个模式 |
| 自动开始 | 无需手动干预自动开始下一个计时器 |
| 通知 | 计时结束时启用桌面通知 |

### 统计

访问统计对话框查看：

- 每日专注时长趋势（折线图）
- 每周专注会话分布（柱状图）
- 月度专注模式（折线图）
- 时段分布热力图（每小时专注模式）
- 总专注时长和会话次数
- 可配置时间范围（7/30/90 天或全部）

---

## 架构

### Web Worker 计时器模式

计时器在 Web Worker（`src/workers/timerWorker.ts`）中运行，确保无论浏览器节流或标签页焦点状态如何都能准确计时。

**Worker 通信：**
- `WorkerCommand` (main → worker): START, PAUSE, RESUME, RESET, SET_TIME
- `WorkerMessage` (worker → main): UPDATE（每秒）, COMPLETE

每个计时器模式（`focus`、`break`、`longBreak`）在 Worker 中维护独立状态，支持并行计时器跟踪。

### 状态持久化

所有应用状态使用前缀键（`tomato-*`）持久化到 localStorage。应用初始化时的恢复机制：

1. 读取保存的模式和剩余时间值
2. 恢复 `wasRunning` 标志以确定自动恢复行为
3. 使用保存的值重新创建 Worker 状态

---

## 配置

### 路径别名

TypeScript 路径别名 `@/*` 映射到 `src/*`：

```typescript
import { WorkerCommand } from '@/types/worker';
```

### 环境

基本功能不需要环境变量。所有设置通过 UI 管理并存储在 localStorage 中。

---

## 开发注意事项

### 常见陷阱

**日期字符串处理和时区问题**

**问题**：`new Date("YYYY-MM-DD")` 将仅日期字符串解析为 UTC 时间（00:00:00 UTC），这可能在非 UTC 时区导致错误的日期比较。

**解决方案**：对于仅日期字符串比较，使用 `toISOString().substring(0, 10)` 将两个日期转换为 UTC 字符串格式后再比较。

```typescript
// ❌ 错误：在非 UTC 时区失败
const recordDate = new Date(record.date);
if (recordDate <= today) { ... }

// ✅ 正确：使用字符串比较
const todayString = today.toISOString().substring(0, 10);
if (record.date <= todayString) { ... }
```

**位置**：参见 [src/App.tsx:1034-1064](src/App.tsx#L1034-L1064) 查看更正后的实现。

---

## 贡献

欢迎贡献！请遵循以下步骤：

1. 分叉仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开拉取请求

---

## 许可证

[MIT License](LICENSE)

---

## 致谢

- [Pomodoro Technique](https://cirillocompany.com/pages/pomodoro-technique) by Francesco Cirillo
- [Linear](https://linear.app) 设计灵感
- 构建工具：[React](https://react.dev)、[Vite](https://vitejs.dev) 和 [Material-UI](https://mui.com)

---

## 支持

如果你遇到任何问题或有疑问，请：

- 在 GitHub 上提交问题
- 查看现有文档
- 查看[架构](#架构)部分了解技术细节

**在线演示**：[部署你自己的实例并在此添加链接！]
