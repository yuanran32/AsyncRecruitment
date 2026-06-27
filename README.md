# 实验室招新平台前端开发文档

本工程是实验室招新平台的前端单页应用，技术栈为 Vue 3、Vite、TypeScript、Vue Router、Pinia、Element Plus、Axios、markdown-it、ECharts。

当前项目已完成基础工程、布局、路由、权限守卫、API 封装和一套本地 Mock API。后续页面开发应优先复用现有目录、类型和接口封装。

---

## 1. 快速启动

```bash
npm install
npm run dev
```

开发地址：

```text
http://127.0.0.1:5173/
```

构建检查：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

Windows PowerShell 如果拦截 `npm`，使用：

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

---

## 2. 环境变量

本地默认启用 Mock API，配置在 `.env.local`：

```env
VITE_USE_MOCK_API=true
```

常用配置：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | `true` | 是否 mock 全部主要后端接口 |
| `VITE_ENABLE_MOCK_AUTH` | 未设置 | 只 mock 登录，不 mock 其他接口 |

接真实后端时改为：

```env
VITE_USE_MOCK_API=false
```

修改 `.env.local` 后需要重启 Vite 开发服务器。

---

## 3. Mock 账号

开启 `VITE_USE_MOCK_API=true` 后，登录页会显示演示账号按钮，也可以手动输入：

| 角色 | 邮箱 | 密码 | 登录后入口 |
| --- | --- | --- | --- |
| 新生 | `student@example.com` | `Pass1234` | `/app` |
| 负责人 | `leader@example.com` | `Pass1234` | `/app`，显示负责人菜单 |
| 管理员 | `admin@example.com` | `Admin1234` | `/admin` |

Mock 登录态保存在 `localStorage`，退出登录会清除。

---

## 4. 后端代理

Vite 开发服务器代理配置在 `vite.config.ts`：

```text
/api     -> http://localhost:8081
/uploads -> http://localhost:8081
```

真实后端至少需要提供：

- `GET /api/v1/meta/current-period`
- `GET /api/v1/directions`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

完整接口以根目录的 `API需求文档与技术栈选型.md` 为准。

---

## 5. 目录结构

```text
src
├── api
│   ├── http.ts          # Axios 实例、统一响应、错误码处理、mock adapter 接入
│   ├── auth.ts          # 登录注册、找回密码、修改密码
│   ├── applications.ts  # 报名申请
│   ├── announcements.ts # 公告
│   ├── materials.ts     # 学习资料
│   ├── tasks.ts         # 任务、提交、批阅、成绩
│   ├── groups.ts        # 分组与成员
│   ├── admin.ts         # 管理端接口
│   └── files.ts         # 文件上传
├── assets               # 全局样式和静态资源
├── components
│   ├── common           # 通用展示组件
│   ├── forms            # 表单组件
│   └── markdown         # Markdown 渲染/编辑相关组件
├── layouts              # AuthLayout、UserLayout、AdminLayout
├── mocks                # 本地 mock 数据与 mock adapter
├── router               # 路由表、权限守卫、路由 meta 类型
├── stores               # Pinia 状态
├── types                # API 类型、枚举、分页结构
├── utils                # 标签、mock 登录等工具
└── views
    ├── auth             # 登录、注册、找回密码
    ├── app              # 用户端页面
    ├── leader           # 负责人页面
    ├── admin            # 管理端页面
    └── error            # 403、404
```

---

## 6. 当前实现状态

已完成：

- 工程配置、TypeScript、Vite、Element Plus
- Vue Router 路由和角色权限守卫
- Pinia 用户态和时期/方向状态
- Axios 统一封装和业务错误码处理
- 本地 Mock API
- 登录、注册、找回密码、重置密码基础页
- 用户端布局、管理端布局、认证布局
- 用户首页、报名列表、任务列表、任务详情基础页
- 管理端仪表盘基础页
- 大部分规划页面已接入路由占位

待完善：

- 报名新增、编辑、撤回、详情
- 公告列表/详情
- 资料列表/详情
- 我的分组、分组详情、我的成绩、个人设置
- 任务提交表单、附件上传、提交历史细节
- 负责人公告、任务、批阅、组员页面
- 管理端时期、方向、用户、分组、负责人、公告、资料、任务、导出页面
- 公共组件：分页表格、筛选栏、文件上传、Markdown 编辑器、表单弹窗、批阅弹窗

---

## 7. 路由和权限

主要入口：

```text
/login
/register
/forgot-password
/reset-password
/app
/leader
/admin
/403
/404
```

路由权限通过 `meta` 配置：

```ts
meta: {
  title: '我的报名',
  requiresAuth: true,
  roles: ['FRESHMAN', 'LEADER', 'ADMIN'],
  periodHint: ['REGISTRATION']
}
```

约定：

- `requiresAuth=true` 的页面会先调用 `/auth/me`
- `roles` 只做前端体验拦截，后端仍必须鉴权
- `periodHint` 只用于前端禁用按钮或提示，不代替后端时期校验
- 管理端仅 `ADMIN` 可访问
- 负责人页面仅 `LEADER` 和 `ADMIN` 可访问

---

## 8. API 开发约定

页面不要直接使用 `axios`，统一从 `src/api/*` 引入接口函数。

示例：

```ts
import { getApplications } from '@/api/applications';

const applications = await getApplications();
```

统一响应结构：

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  requestId: string;
}
```

分页结构：

```ts
interface PageResult<T> {
  list: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
```

错误码处理集中在 `src/api/http.ts`，页面只处理具体业务状态。

---

## 9. Mock API 维护

Mock 入口：

```text
src/mocks/data.ts
src/mocks/adapter.ts
```

新增页面接口时，优先做两件事：

1. 在 `src/api/*.ts` 中补真实接口函数和类型。
2. 在 `src/mocks/adapter.ts` 中补对应 mock 返回。

Mock 返回也必须保持统一响应结构，不要在页面里写临时假数据。

---

## 10. 两人前端分工建议

推荐采用“**A 总负责人 + B 业务页面负责人**”的方式。A 不只负责架构，也负责用户侧主流程和关键联调；B 负责负责人端、管理端等后台类页面的批量落地。

### 10.1 总体分工

| 人员 | 角色 | 负责范围 |
| --- | --- | --- |
| A | 前端总负责人 | 工程规范、公共组件、接口规范、权限路由、认证流程、用户端主流程、接口联调、代码 Review |
| B | 业务页面负责人 | 负责人端、管理端、后台 CRUD、分组管理、任务批阅、数据导出 |

### 10.2 A 的具体任务

A 负责前端公共底座和用户端核心闭环，任务拆分如下：

#### 工程与公共底座

```text
src/api/http.ts          # Axios 实例、Cookie、CSRF、统一错误处理
src/router/index.ts      # 路由、权限守卫、页面 meta
src/types/api.ts         # 全局 API 类型、枚举、分页结构
src/stores/auth.ts       # 登录态、当前用户、登出、修改密码
src/stores/meta.ts       # 当前时期、方向数据
src/layouts/AuthLayout.vue
src/layouts/UserLayout.vue
src/components/common
src/components/forms
src/components/markdown
```

主要事项：

- 统一接口调用方式，页面不得直接使用 `axios`。
- 维护 `ApiResponse<T>`、分页结构和核心业务类型。
- 维护登录态恢复、权限跳转、时期提示等全局行为。
- 设计并维护公共组件的 props、事件和使用规范。

#### 认证与账号体系

```text
src/views/auth/LoginView.vue
src/views/auth/RegisterView.vue
src/views/auth/ForgotPasswordView.vue
src/views/auth/ResetPasswordView.vue
src/views/app/SettingsView.vue
src/api/auth.ts
```

主要事项：

- 登录、注册、找回密码、重置密码。
- 登出、获取当前用户、修改密码。
- Cookie 登录态、`XSRF-TOKEN`、`X-CSRF-TOKEN` 联调。
- 登录后按角色跳转用户端或管理端。

#### 用户端核心页面

```text
src/views/app/DashboardView.vue
src/views/app/ApplicationsView.vue
```

主要事项：

- 用户首页。
- 报名列表。
- 报名新增、编辑、撤回、详情。
- 当前时期下的按钮禁用和提示。
- 报名状态展示。

#### 用户端任务链路

```text
src/views/app/TasksView.vue
src/views/app/TaskDetailView.vue
```

主要事项：

- 任务列表。
- 任务详情。
- 任务提交。
- 附件上传。
- 提交历史。
- 提交状态和成绩展示入口。

#### 用户端展示类页面

```text
src/views/app/announcements
src/views/app/materials
src/views/app/groups
src/views/app/scores
```

当前项目里这些页面可按实际情况新增具体视图文件，或从占位页逐步替换。

主要事项：

- 公告列表、公告详情。
- 资料列表、资料详情。
- 我的分组、分组详情。
- 我的成绩。
- Markdown 内容展示和附件下载。

#### Mock、联调与质量把关

```text
src/mocks/data.ts
src/mocks/adapter.ts
```

主要事项：

- 维护认证和用户端相关 Mock API。
- 接真实后端前关闭 Mock 并跑通关键流程。
- 负责 `npm run build` 检查。
- Review B 涉及公共文件的改动。
- 把公共交互规范沉淀到 README。

### 10.3 B 的具体任务

B 负责负责人端和管理端业务页面，任务拆分如下：

#### 负责人端

```text
src/views/leader
src/api/leader.ts
```

主要事项：

- 组内公告管理。
- 组内任务管理。
- 任务批阅。
- 组员信息查看。

#### 管理端

```text
src/views/admin
src/api/admin.ts
```

主要事项：

- 管理端仪表盘。
- 时期管理。
- 方向管理。
- 用户与报名管理。
- 分组管理。
- 负责人任命。
- 公告管理。
- 资料管理。
- 任务管理。
- 成绩总览与导出。

#### 管理端 Mock 与接口联调

```text
src/mocks/data.ts
src/mocks/adapter.ts
```

主要事项：

- 补充管理端和负责人端 Mock 数据。
- 补充管理端和负责人端接口函数。
- 确保表格、筛选、分页、弹窗表单和删除确认流程完整。

### 10.4 公共文件修改规则

以下文件由 A 主导维护，B 如需修改，应先沟通改动点：

```text
src/router/index.ts
src/api/http.ts
src/stores/auth.ts
src/stores/meta.ts
src/types/api.ts
src/layouts/UserLayout.vue
src/layouts/AdminLayout.vue
src/components
```

协作约定：

- 公共组件先定 props、事件、插槽，再批量用于页面。
- 新增接口必须先写 `src/api/*.ts`，再在页面调用。
- 新增类型优先放到 `src/types/api.ts`，避免页面里散落临时类型。
- 写操作统一有 loading、失败提示；删除、撤回类操作必须二次确认。
- B 开发页面时如果缺公共组件，优先提需求给 A，避免每个页面各写一套。

---
## 11. 页面开发规范

- 页面统一放在 `src/views/{auth|app|leader|admin}`。
- 页面标题使用 `PageHeader`。
- 状态标签使用 `StatusTag`。
- 当前时期展示使用 `PeriodBadge`。
- Markdown 展示使用 `MarkdownViewer`，不要直接 `v-html`。
- 方向选择使用 `DirectionCascader`。
- 新增业务类型优先补到 `src/types/api.ts`。
- 新增接口优先补到 `src/api`，不要散落在页面里。
- 写操作必须有 loading、失败提示，删除/撤回类操作必须二次确认。

---

## 12. 接后端检查清单

关闭 mock：

```env
VITE_USE_MOCK_API=false
```

确认：

- 后端运行在 `localhost:8081`
- 登录接口能设置 HttpOnly Cookie
- 后端允许前端开发域携带 Cookie
- `/api/v1/auth/me` 能根据 Cookie 返回用户
- 所有接口返回统一 `ApiResponse<T>`
- 分页接口返回 `PageResult<T>`
- 文件地址 `/uploads/**` 可由后端访问

常见问题：

- 刷新受保护页面跳登录：检查 `/auth/me` 和 Cookie。
- 登录成功但后续接口 401：检查 Cookie domain/path/sameSite。
- 开发环境跨域：优先使用 Vite proxy，不要让页面直接请求完整后端域名。

