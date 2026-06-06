# FitPro 健身房私教排期工作台

## 原始需求

> 做一个健身房门店使用的私教排期页面，React + Vite 适合把教练日历、会员档案、课包余额和体测曲线组合成前台工作台。页面围绕会员基础信息、体测指标、私教课包、教练排班、课程预约、训练目标和请假改约展开。前台要能快速安排会员和教练的时间，私教要看到会员最近体测、伤病限制和本周期训练重点；店长关注教练空档、课包消耗和高风险退课。页面风格偏运动门店运营，课程日历要清楚，体测曲线和课包扣减不能藏在多层弹窗里。
> 增加伤病限制提醒。会员体测或备注中记录膝伤、腰伤、心率异常后，私教排课时页面提示不适合的训练项目；教练仍安排高强度课程时，需要填写训练调整说明。

## 项目简介

FitPro 健身房私教排期前台工作台，整合教练日历排班、会员档案管理、课包余额追踪和体测数据可视化，服务于前台、私教、店长三种角色，解决排期混乱、信息分散、课包消耗不透明等门店运营痛点。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **状态管理**: Zustand 5
- **路由**: React Router DOM 7
- **样式方案**: TailwindCSS 3 + 自定义深色工业风主题
- **图标库**: lucide-react
- **图表**: 原生 SVG 实现体测曲线和运营图表（无第三方图表库依赖

## 目录结构

```
src/
├── assets/                 # 静态资源
├── components/             # 通用组件
│   ├── booking/            # 预约相关组件
│   │   ├── BookingModal.tsx      # 新建预约弹窗
│   │   ├── RescheduleModal.tsx   # 改约弹窗
│   │   └── LeaveModal.tsx       # 请假弹窗
│   ├── calendar/           # 日历相关组件
│   │   ├── WeekCalendar.tsx     # 周视图日历
│   │   ├── CalendarSlot.tsx     # 日历时间段插槽
│   │   └── CoachTabs.tsx        # 教练切换标签
│   ├── dashboard/          # 工作台组件
│   │   ├── StatCard.tsx       # 统计数据卡片
│   │   └── TodoList.tsx       # 待办事项列表
│   ├── layout/             # 布局组件
│   │   ├── AppLayout.tsx      # 主布局
│   │   ├── Header.tsx         # 顶部导航栏
│   │   ├── Sidebar.tsx        # 侧边栏导航
│   │   └── RoleTabs.tsx       # 角色切换标签
│   ├── manager/            # 店长看板组件
│   │   ├── CoachUtilization.tsx   # 教练利用率柱状图
│   │   ├── PackageConsumption.tsx # 课包消耗趋势折线图
│   │   └── RiskAlertList.tsx   # 高风险退课预警
│   └── member/             # 会员相关组件
│       ├── MemberCard.tsx       # 会员卡片
│       ├── MemberSearch.tsx     # 会员搜索
│       ├── BodyMetricsChart.tsx   # 体测曲线图
│       ├── PackageCard.tsx      # 课包余额卡
│       └── TrainingGoal.tsx    # 伤病与训练目标
├── pages/                   # 页面
│   ├── Dashboard.tsx       # 工作台首页
│   ├── Members.tsx         # 会员列表
│   ├── MemberDetail.tsx    # 会员档案详情
│   ├── Calendar.tsx        # 教练日历
│   └── Manager.tsx       # 店长看板
├── store/                   # Zustand stores
│   ├── useMemberStore.ts
│   ├── useCoachStore.ts
│   ├── useBookingStore.ts
│   ├── usePackageStore.ts
│   └── useMetricStore.ts
├── data/                    # Mock 数据
│   ├── members.ts
│   ├── coaches.ts
│   ├── bookings.ts
│   ├── packages.ts
│   └── metrics.ts
├── utils/                   # 工具函数
│   ├── date.ts
│   ├── chart.ts
│   └── validation.ts
├── types/                   # TypeScript 类型定义
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 启动方式

### 前置要求

- Node.js >= 18
- npm >= 9 或 pnpm >= 8
- Docker >= 24（如需 Docker 启动）
- Docker Compose >= 2

### 本地启动

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动开发服务

```bash
npm run dev
```

访问地址：http://localhost:5173

### Docker 一键启动（推荐）

#### 1. 构建并启动服务

```bash
docker compose up --build
```

如需后台运行：

```bash
docker compose up --build -d
```

访问地址：http://localhost:3000

#### 2. 停止和清理服务

```bash
docker compose down
```

### 其他命令

```bash
# TypeScript 类型检查
npm run check

# 代码检查
npm run lint

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 功能模块说明

### 工作台首页（Dashboard）

- 角色切换：前台 / 私教 / 店长三种视角
- 数据概览：今日课程、到店会员、待签到、课包告警
- 周视图日历 + 教练切换：快速查看和安排课程
- 会员搜索 + 待办事项列表

### 会员管理（Members）

- 会员搜索：按姓名、手机号搜索
- 会员等级筛选
- 会员档案详情：
  - 基础信息卡
  - 体测曲线：体重、体脂率、肌肉量、BMI
  - 课包余额：进度条、扣减记录
  - 伤病限制和训练目标
  - 最近预约记录

### 教练日历（Calendar）

- 周视图网格：6:00-22:00 每小时一格
- 教练切换标签
- 课程状态颜色区分
- 点击空档快速创建预约
- 点击课程改约/请假操作
- 含伤病调整说明的课程显示黄色「调整」标记

### 伤病限制提醒

- **自动识别**：从会员伤病档案、备注、体测静息心率三个数据源自动识别膝伤、腰伤、心率/心血管异常、肩伤、脚踝损伤、颈椎问题等风险
- **三层提示**：
  1. 选中会员即展示伤病告警卡片，包含伤病详情和推荐课程类型（瑜伽、普拉提、康复训练等）
  2. 课程类型按钮标记「高强度」徽标，对不适合的课程显示红色边框 + ⚠️ 警告图标
  3. 选中不适合课程后出现醒目警告横幅
- **安全机制**：会员存在伤病且选择了高强度不适配课程时，**强制填写训练调整说明**，未填写无法提交预约
- **日历联动**：已排课程在日历卡片上展示黄色「调整」徽标和调整说明摘要

### 店长看板（Manager）

- 教练利用率柱状图
- 课包消耗趋势
- 高风险退课预警

## 设计风格

- 主色调：深墨黑 #0F0F0F 搭配活力橙 #FF6B35
- 辅助色：石灰绿 #8BC34A（正常）、警示红 #EF4444（告警）、信息蓝 #3B82F6（提示）
- 字体：Oswald（运动感粗体用于标题、Inter（清晰易读用于正文
- 深色工业运动风，强调数据清晰度和操作效率
