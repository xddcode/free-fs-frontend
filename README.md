# Free FS React

基于 React 18 + TypeScript + shadcn/ui 的文件管理系统前端

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router 6** - 路由管理
- **Zustand** - 状态管理
- **TanStack Query** - 数据获取和缓存
- **shadcn/ui** - UI 组件库
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP 客户端

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
react-app/
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

## 环境变量

创建 `.env.development` 和 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 开发进度

### 已完成
- ✅ 项目基础架构
- ✅ 路由配置
- ✅ 状态管理（Zustand）
- ✅ API 请求封装
- ✅ 用户认证流程
- ✅ 基础 UI 组件
- ✅ 登录页面
- ✅ 布局组件

### 待完成
- ⏳ 文件管理页面
- ⏳ 文件上传功能
- ⏳ 传输任务管理
- ⏳ 存储配置管理
- ⏳ 个人设置页面
- ⏳ 文件分享功能

## License

Apache-2.0
