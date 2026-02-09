# 开发日志

<!-- 以上内容由 conventional-changelog 自动生成 -->

## 手动维护历史


## [1.0.6](https://github.com/CuartPyaw/PomoZen/compare/v1.0.5...v1.0.6) (2026-02-09)

* 👷 ci(release): 更新 GitHub Actions 工作流中的依赖缓存策略。 ([](https://github.com/CuartPyaw/PomoZen/commit/5145728c27448575459dcda8b672b06b956aafb4))

### fix

* 提交 package-lock.json 确保 CI 依赖一致性 ([](https://github.com/CuartPyaw/PomoZen/commit/db13c9c628660ec45b75ded220d468a0d82fb990))

## [1.0.5](https://github.com/CuartPyaw/PomoZen/compare/v1.0.4...v1.0.5) (2026-02-09)

* ✨ feat(App): 新增GTD任务管理功能并重构布局。 ([](https://github.com/CuartPyaw/PomoZen/commit/6ef03c7a87d34953d71d74d9b5947b5f97a225a0))
* 🔧 chore(release-it): 移除发布配置中的 assets 字段。 ([](https://github.com/CuartPyaw/PomoZen/commit/cee3a0daf4d18b3f107ebb5ffdb913b23b54bb9b))
* 🔧 chore(release): 配置 @release-it/conventional-changelog 插件 ([](https://github.com/CuartPyaw/PomoZen/commit/b0dc0965e2a36e7def22c922c740df93df1d33b1))

# 开发日志

## 2026-02-08

### 新增功能

#### 1. 暗色模式支持
- 新增完整的暗色/浅色主题切换功能
- 三种主题模式可选：
  - **浅色**：始终使用浅色模式
  - **跟随**：自动跟随操作系统暗色模式设置（`prefers-color-scheme`）
  - **暗色**：始终使用暗色模式
- 主题偏好持久化到 localStorage
- 系统主题变化时自动切换（仅在选择「跟随」模式时）
- 设置面板新增「🎨 外观设置」区域

#### 2. 暗色模式主题设计
- 基于禅意美学的暗色配色方案：
  - 背景色：墨色系 (`#1A1E1D`, `#1F2423`, `#252B2A`)
  - 文字色：宣纸白 (`#F0ECE5`)、浅宣纸 (`#A8B0AF`)
  - 强调色：亮竹青 (`#8FA398`, `#9FB5AA`)
- 暗色模式背景渐变和光斑效果
- 暗色模式网格和滚动条样式

#### 3. 丝滑主题切换动画
- 全局主题属性过渡动画（0.3s）
- 使用 `cubic-bezier(0.16, 1, 0.3, 1)` 缓动函数
- 背景层、文字、边框、阴影平滑过渡
- 尊重 `prefers-reduced-motion` 用户偏好

#### 4. 工具栏主题切换按钮
- 在工具栏添加了主题快速切换按钮
- 用户可以在不进入设置的情况下快速切换主题模式
- 按钮图标根据当前主题动态显示（太阳/月亮/自动图标）

#### 5. useTimer 监听设置变化
- 当用户修改时间设置后，计时器自动更新剩余时间
- 实现了设置变化与运行中计时器的同步
- 避免了设置修改后需要重启计时器的问题

#### 6. 设置对话框重构
- 新增未保存更改离开确认功能
- 添加高级功能设置区域
- 改进设置对话框的用户体验和布局

#### 7. 环形进度计算重构与日志功能
- 重构 App 组件中的环形进度条计算逻辑
- 添加详细的日志记录功能，便于调试和监控
- 优化了进度条渲染性能

### 样式改进

#### 1. 暗色模式组件适配
- 快捷键、专注统计、运行状态卡片在暗色模式下使用浅色文字
- 设置对话框主题切换按钮组适配暗色模式
- 图标根据主题偏好动态切换

#### 2. 计时器进度条颜色管理
- 重构进度条配置系统
- 优化主题颜色应用到进度条
- 实现进度条颜色与主题模式的动态同步

### Bug 修复

#### 1. 通知系统闭包陷阱修复
- **问题**: "自动跳过通知"和"通知声音"设置无效，开关状态变化后不生效
- **根因**: React 闭包陷阱 - `sendNotification` 和 `handleTimerComplete` 函数在 worker 消息回调中捕获了创建时的状态值，而非最新值
- **修复**: 使用 `useRef` 存储状态的最新值，确保函数始终访问到最新的设置
  - 添加 `autoSkipNotificationRef` 和 `soundEnabledRef`
  - 通过 useEffect 同步状态到 ref
  - 更新 `sendNotification` 和 `handleTimerComplete` 使用 ref 值
- **影响文件**: `src/App.tsx`

#### 2. useTimer onComplete 回调引用问题
- **问题**: 计时器完成时回调函数引用不正确，导致无法正确触发
- **修复**: 修复 useTimer 钩子中 onComplete 回调函数的引用问题
- **影响文件**: `src/hooks/useTimer.ts`

### 文件变更

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/theme/index.ts` | 重构 | 添加 `ThemeMode` 类型、`darkDesignTokens`、`createZenTheme(mode)` |
| `src/App.tsx` | 修改 | 添加主题状态管理、系统主题监听、外观设置 UI、环形进度计算重构、日志功能 |
| `src/styles/background.css` | 新增 | 添加 `[data-theme="dark"]` 暗色模式样式 |
| `src/index.css` | 新增 | 添加主题切换过渡动画 |
| `src/components/Timer.tsx` | 修改 | 添加主题切换按钮 |
| `src/hooks/useTimer.ts` | 修改 | 添加设置监听、修复回调引用 |
| `src/components/SettingsDialog.tsx` | 重构 | 未保存确认、高级功能区域 |

---

## 2026-02-06

### 新增功能

#### 1. 中国禅意设计系统
- 将应用主题从 Linear/Modern 深色系统重构为中国禅意风格
- 采用"竹林清风"配色方案：
  - 竹青 (`#7A918D`) - 专注模式主色
  - 宣纸白 (`#F0ECE5`) - 背景色
  - 墨黑 (`#2C2C2C`) - 文字色
  - 暖木 (`#C4A77D`) - 短休息模式色
- 重构阴影系统，采用更柔和淡雅的效果
- 更新背景动态光斑为禅意色调（竹青、暖木、青瓷）

#### 2. 统计图表系统
- 新增专注统计图表组件架构
- 实现每日统计折线图 (`DailyLineChart`)
- 实现每周统计柱状图 (`WeeklyBarChart`)
- 实现月度统计折线图 (`MonthlyLineChart`)
- 实现时段分布热力图 (`TimeDistributionHeatmap`)
- 支持多种视图模式：每日/每周/每月
- 支持多种数据指标：时长/次数/平均
- 支持时间范围筛选：7天/30天/90天/全部

#### 3. 设置面板样式优化
- 设置标题"设置"改为居中显示
- 设置标题文字颜色改为青瓷色 (`#7A918D`)

#### 4. 项目品牌更新
- 应用显示名称从 "Tomato Clock" 更改为 "PomoZen"
- 项目名称从 `tomato-clock` 更改为 `pomozen`
- 更新所有文档和配置文件中的项目引用

### Bug 修复

#### 1. 长休息模式主题颜色
- **问题**: 长休息模式使用不正确的主题颜色
- **修复**: 将长休息模式颜色更新为正确的灰色系
  - 主色调: `#6A6A6A`
  - 高亮色: `#7A7A7A`
  - 发光效果: `rgba(106,106,106,0.3)`

#### 2. Typography 组件语法错误
- **问题**: 设置面板标题的 Typography 组件缺少 `sx` 属性定义
- **修复**: 添加正确的 `sx` 属性：
  ```tsx
  sx={{ color: '#7A918D', flex: 1, textAlign: 'center' }}
  ```

#### 3. 时间显示计算错误
- **问题**: 时间显示计算存在错误
- **修复**: 修正时间计算逻辑

#### 4. 日期比较时区问题
- **问题**: `new Date("YYYY-MM-DD")` 在非 UTC 时区导致日期比较错误
- **修复**: 使用字符串格式进行比较
  ```typescript
  const todayString = new Date().toISOString().substring(0, 10);
  if (record.date <= todayString) { ... }
  ```

### 样式改进

#### 1. 界面颜色主题调整
- 从亮色主题调整为深色主题，后改为中国禅意浅色主题
- 提升文本颜色对比度
- 优化按钮样式的一致性

#### 2. 组件样式优化
- 移除特定模式下的样式条件渲染
- 更新焦点模式按钮样式
- 优化阴影样式格式
- 移除未使用的 App.css 导入

### 文档更新

#### 1. README 文档
- 更新项目名称为 "PomoZen"
- 添加中文副标题说明（Pomodoro Zen）
- 更新所有 `tomato-clock` 引用为 `pomozen`
- 更新 Docker 部署文档
- 更新项目仓库链接

#### 2. 部署配置
- 更新 `docker-compose.yml` 中的服务名称
- 更新 `DOCKER_DEPLOYMENT.md` 中的镜像名称
- 更新 `package.json` 中的项目名称

---

## 修改文件汇总

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/App.tsx` | 修改 | 主题系统、设置面板样式、应用名称 |
| `src/theme/index.ts` | 重构 | 中国禅意设计系统 |
| `src/styles/background.css` | 修改 | 背景样式匹配禅意主题 |
| `src/components/Charts/*` | 新增 | 统计图表组件 |
| `src/components/FocusCharts.tsx` | 新增 | 图表入口组件 |
| `package.json` | 修改 | 项目名称更新 |
| `README.md` | 修改 | 项目名称和链接更新 |
| `README.zh-CN.md` | 修改 | 中文文档更新 |
| `docker-compose.yml` | 修改 | 服务名称更新 |
| `DOCKER_DEPLOYMENT.md` | 修改 | Docker 文档更新 |

---

## 提交记录

```
d2f9cfe 📝 docs(README): 更新 README 中文文档中的项目名称和描述。
7eab1c7 ✨ feat(App): 更新应用显示名称。
b209433 🔧 chore(docs): 更新项目名称从 "tomato-clock" 到 "pomozen"。
1e7a24d 🔧 chore(package): 更新项目名称。
cb37f78 🐛 fix(App): 修复 Typography 组件的样式属性语法错误。
80f24f4 🐛 fix(theme): 修复长休息模式下的主题颜色。
f905fe2 🌈 style(ui): 将界面颜色主题从亮色调整为深色。
b4768e7 🌈 style(App): 更新组件样式以改进主题一致性。
a307823 ✨ feat(App): 更新焦点模式按钮样式
8dbc92a 🌈 style(theme): 优化阴影样式的格式。
566132a 🌈 style(App): 移除特定模式下的样式条件渲染。
7c19b47 ✨ feat(App): 优化专注、休息和长休息模式下的按钮样式
6fc4cee 🌈 style(App): 更新多个UI元素的文本颜色以提升对比度。
9b34a9e 🔧 chore(App.tsx): 移除未使用的 App.css 导入。
34141db ✨ feat(theme): 将主题从 Linear/Modern 设计系统重构为中国禅意设计系统。
```
