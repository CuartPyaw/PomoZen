# 开发日志

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
