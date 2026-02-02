<div align="center">

<img alt="Free FS Logo" src="https://gitee.com/xddcode/free-fs/raw/feature-vue/.images/logo.svg" width="100"/>

# Free FS

### 现代化文件管理网盘系统

一个基于 Spring Boot 3.x 的企业级文件管理网盘系统后端，专注于提供高性能、高可靠的文件存储和管理服务。

 <img src="https://img.shields.io/badge/Spring%20Boot-3.5.4-blue.svg" alt="Downloads">
 <img src="https://img.shields.io/badge/Vue-3.2-blue.svg" alt="Downloads">

[![star](https://gitee.com/dromara/free-fs/badge/star.svg?theme=dark)](https://gitee.com/dromara/free-fs/stargazers)
[![fork](https://gitee.com/dromara/free-fs/badge/fork.svg?theme=dark)](https://gitee.com/dromara/free-fs/members)
[![GitHub stars](https://img.shields.io/github/stars/dromara/free-fs?logo=github)](https://github.com/dromara/free-fs/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dromara/free-fs?logo=github)](https://github.com/dromara/free-fs/network)
[![AUR](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](https://gitee.com/dromara/free-fs/blob/master/LICENSE)

[问题反馈](https://gitee.com/dromara/free-fs/issues) · [功能请求](https://gitee.com/dromara/free-fs/issues/new)

[项目文档](https://free-fs.top/)

</div>

---

## 源码地址

[Gitee：https://gitee.com/dromara/free-fs](https://gitee.com/dromara/free-fs)

[GitHub：https://github.com/dromara/free-fs](https://github.com/dromara/free-fs)

## 后端仓库

[![Free FS/free-fs](https://gitee.com/dromara/free-fs/widgets/widget_card.svg?colors=393222,ebdfc1,fffae5,d8ca9f,393222,a28b40)](https://gitee.com/dromara/free-fs.git)

---

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router 6** - 路由管理
- **Zustand** - 状态管理
- **TanStack Query** - 数据获取和缓存
- **shadcn/ui** - UI 组件库
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP 客户端

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm 或 pnpm 或 yarn

### 安装依赖

```bash
# 克隆项目
git clone https://gitee.com/xddcode/free-fs-frontend.git

# 进入项目目录
cd free-fs-frontend

# 安装依赖 推荐pnpm构建
npm install | pnpm install | yarn

```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 启动
pnpm start
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
free-fs-frontend/
├── src/
│   ├── api/              # API 请求
│   ├── components/       # 组件
│   │   └── ui/          # shadcn/ui 组件
│   ├── lib/             # 工具函数
│   ├── pages/           # 页面组件
│   ├── router/          # 路由配置
│   ├── services/        # 服务层
│   ├── store/           # 状态管理
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 根组件
│   └── main.tsx         # 入口文件
├── public/              # 静态资源
└── index.html           # HTML 模板
```

### 开发工具

- [ESLint](https://eslint.org/) - 代码检查工具
- [Prettier](https://prettier.io/) - 代码格式化工具
- [Husky](https://typicode.github.io/husky/) - Git hooks 工具
- [Commitlint](https://commitlint.js.org/) - Git 提交信息规范

---

## 配置说明

### 环境变量

创建 `.env.development` 和 `.env.production` 文件：

```env
# API 基础路径
VITE_API_BASE_URL=http://localhost:8080

# 其他配置...
```

---

## 贡献指南

我们欢迎所有的贡献，无论是新功能、Bug 修复还是文档改进！

### 贡献步骤

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)
- 编写单元测试（如适用）

### Commit 规范

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链更新
```

---

## 问题反馈

如果你发现了 Bug 或有功能建议，请通过以下方式反馈：

- [Gitee Issues](https://gitee.com/dromara/free-fs/issues)

---

## 鸣谢

- [Vue.js](https://vuejs.org/) - 感谢 Vue 团队
- [Arco Design](https://arco.design/) - 感谢字节跳动设计团队
- 所有贡献者和使用者

---

## 联系方式

- GitHub: [@Freedom](https://github.com/xddcode)
- Gitee: [@Freedom](https://gitee.com/xddcode)
- Email: xddcodec@gmail.com
- 微信：

  **添加微信，请注明来意**

<img alt="wx.png" height="300" src="https://gitee.com/dromara/free-fs/raw/feature-vue/.images/wx.png" width="250"/>

- 微信公众号：

<img alt="wp.png" src="https://gitee.com/dromara/free-fs/raw/feature-vue/.images/mp.png"/>

---

## ❤ 捐赠

如果你认为 free-fs 项目可以为你提供帮助，或者给你带来方便和灵感，或者你认同这个项目，可以为我的付出赞助一下哦！

请给一个 ⭐️ 支持一下！

<img alt="pay.png" height="300" src="https://gitee.com/dromara/free-fs/raw/feature-vue/.images/pay.png" width="250"/>

<div align="center">

Made with ❤️ by [@xddcode](https://gitee.com/xddcode)

</div>
