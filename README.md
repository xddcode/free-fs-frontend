<div align="center">

<img alt="Free FS Logo" src="https://gitee.com/xddcode/free-fs/raw/feature-vue/.images/logo.svg" width="100"/>

# Free FS Frontend

### 现代化文件管理网盘系统 - 前端

基于 React 19 + TypeScript + Vite 8 的企业级文件管理网盘系统前端，提供流畅的用户体验和现代化的界面设计。

<img src="https://img.shields.io/badge/React-19-blue.svg" alt="React">
<img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript">
<img src="https://img.shields.io/badge/Vite-8.x-blue.svg" alt="Vite">

[![star](https://gitee.com/dromara/free-fs/badge/star.svg?theme=dark)](https://gitee.com/dromara/free-fs/stargazers)
[![fork](https://gitee.com/dromara/free-fs/badge/fork.svg?theme=dark)](https://gitee.com/dromara/free-fs/members)
[![GitHub stars](https://img.shields.io/github/stars/dromara/free-fs?logo=github)](https://github.com/dromara/free-fs/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dromara/free-fs?logo=github)](https://github.com/dromara/free-fs/network)
[![AUR](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](https://gitee.com/dromara/free-fs/blob/master/LICENSE)

[问题反馈](https://gitee.com/dromara/free-fs/issues) · [功能请求](https://gitee.com/dromara/free-fs/issues/new) · [项目文档](https://free-fs.top/)

</div>

---

## 📦 仓库地址

**前端仓库：**

- Gitee：[https://gitee.com/xddcode/free-fs-frontend](https://gitee.com/xddcode/free-fs-frontend)
- GitHub：[https://github.com/xddcode/free-fs-frontend](https://github.com/xddcode/free-fs-frontend)

**后端仓库：**

- Gitee：[https://gitee.com/dromara/free-fs](https://gitee.com/dromara/free-fs)
- GitHub：[https://github.com/dromara/free-fs](https://github.com/dromara/free-fs)

---

## 🚀 技术栈

| 技术              | 说明              | 版本   |
| ----------------- | ----------------- | ------ |
| React             | UI 框架           | 19.x   |
| TypeScript        | 类型安全          | 5.9.x  |
| Vite              | 构建工具          | 8.x    |
| React Router      | 路由管理          | 7.x    |
| TanStack Query    | 服务端状态 / 请求 | 5.x    |
| Zustand           | 客户端状态管理    | 5.x    |
| shadcn/ui         | UI 组件库         | Latest |
| Tailwind CSS      | 样式框架（Vite 插件集成） | 4.x    |
| Axios             | HTTP 客户端       | 1.x    |

## ⚡ 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`（与 [Vite 8](https://vite.dev/) 要求一致）
- pnpm >= 9.0.0（推荐；本仓库 lockfile 为 v9）

### 安装依赖

```bash
# 克隆项目
git clone https://gitee.com/xddcode/free-fs-frontend.git

# 进入项目目录
cd free-fs-frontend

# 安装依赖（推荐使用 pnpm）
pnpm install
```

### 配置环境变量

复制 `.env.example` 并创建 `.env.development` 文件：

```bash
# API 基础路径
VITE_API_BASE_URL=http://localhost:8080
```

### 启动开发服务器

```bash
pnpm dev
# 访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
free-fs-frontend/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口定义
│   ├── components/     # 公共组件
│   │   ├── layout/    # 布局组件
│   │   └── ui/        # shadcn/ui 组件
│   ├── contexts/       # React Context
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具库
│   ├── pages/          # 页面组件
│   │   ├── files/     # 文件管理
│   │   ├── login/     # 登录注册
│   │   ├── settings/  # 系统设置
│   │   ├── share/     # 文件分享
│   │   ├── storage/   # 存储管理
│   │   └── transfer/  # 传输管理
│   ├── router/         # 路由配置
│   ├── services/       # 业务服务
│   ├── store/          # Zustand 状态管理
│   ├── styles/         # 全局样式
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 根组件
│   └── main.tsx        # 应用入口
├── .env.example        # 环境变量示例
└── vite.config.ts      # Vite 配置
```

## ✨ 主要功能

- 📂 文件管理：上传、下载、预览、重命名、移动、删除
- 🗂️ 文件夹管理：创建、浏览、面包屑导航
- 🔍 文件搜索：快速查找文件
- ⭐ 文件收藏：收藏常用文件
- 🗑️ 回收站：文件恢复和彻底删除
- 🔗 文件分享：生成分享链接，支持提取码和有效期
- 📊 存储管理：多存储平台配置
- 📈 传输管理：上传下载任务管理
- 🎨 主题切换：支持亮色/暗色模式
- 👤 用户管理：个人信息、账号设置

---

## 🤝 贡献指南

欢迎所有的贡献，无论是新功能、Bug 修复还是文档改进！

### 贡献步骤

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交改动：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)

### Commit 规范

| 类型     | 说明            |
| -------- | --------------- |
| feat     | 新功能          |
| fix      | Bug 修复        |
| docs     | 文档更新        |
| style    | 代码格式调整    |
| refactor | 代码重构        |
| perf     | 性能优化        |
| test     | 测试相关        |
| chore    | 构建/工具链更新 |

---

## 📝 问题反馈

如果你发现了 Bug 或有功能建议，请通过以下方式反馈：

- [Gitee Issues](https://gitee.com/dromara/free-fs/issues)
- [GitHub Issues](https://github.com/dromara/free-fs/issues)

---

## 🙏 鸣谢

- [React](https://react.dev/) - 感谢 React 团队
- [shadcn/ui](https://ui.shadcn.com/) - 感谢 shadcn 提供的优秀组件库
- [Tailwind CSS](https://tailwindcss.com/) - 感谢 Tailwind 团队
- 所有贡献者和使用者

---

## 📧 联系方式

- **GitHub**: [@xddcode](https://github.com/xddcode)
- **Gitee**: [@xddcode](https://gitee.com/xddcode)
- **Email**: xddcodec@gmail.com

### 微信交流

添加微信，请注明来意

<img alt="wx.png" height="300" src=".images/wx.png" width="250"/>

### 微信公众号

<img alt="mp.png" src=".images/mp.png"/>

---

## ❤️ 支持项目

如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！

你也可以通过以下方式支持项目：

<img alt="pay.png" height="300" src=".images/pay.png" width="250"/>

---

<div align="center">

Made with ❤️ by [@xddcode](https://gitee.com/xddcode)

**[⬆ 回到顶部](#free-fs-frontend)**

</div>
