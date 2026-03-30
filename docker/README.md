# Docker 部署指南

## 前提条件

- Docker >= 20.10
- 后端服务 (free-fs) 已启动并可访问

## 快速开始

以下命令均在**项目根目录**下执行，将 `http://your-api:8080` 替换为你的实际后端地址。

```bash
# 1. 构建镜像
docker build -f docker/Dockerfile -t free-fs-frontend .

# 2. 启动容器
docker run -d -p 80:80 \
  -e API_BASE_URL=http://your-api:8080 \
  --name free-fs-frontend \
  free-fs-frontend
```

启动后访问 `http://localhost` 即可。

## 环境变量说明

| 变量 | 用途 | 传入时机 | 是否必填 | 说明 |
|------|------|----------|----------|------|
| `API_BASE_URL` | nginx 反向代理目标地址 | `docker run -e` | **是** | nginx 将 `/apis/` 请求转发到此地址 |
| `VITE_API_BASE_URL` | 前端 JS 中的后端地址（接口与文件预览） | `docker build --build-arg` | 否 | 不传则使用 `.env.production` 中的值 |

> **说明**：`.env.production` 中 `VITE_API_BASE_URL` 默认为空，前端会使用相对路径请求 `/apis/...`，由 nginx 代理转发到后端。如果在构建时通过 `--build-arg` 指定了完整地址（如 `http://api.example.com`），浏览器会直接请求该地址，不再经过 nginx 代理。

构建时指定 API 地址的示例：

```bash
docker build -f docker/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://your-api:8080 \
  -t free-fs-frontend .
```

## 自定义端口

```bash
# 映射到 3000 端口
docker run -d -p 3000:80 \
  -e API_BASE_URL=http://your-api:8080 \
  --name free-fs-frontend \
  free-fs-frontend
```

## 常见问题

### 页面打开后接口 404

检查 `API_BASE_URL` 是否正确指向后端服务。如果前后端在同一台机器上，不要使用 `localhost`，应使用宿主机 IP 或 Docker 网络名称。

### 刷新页面 404

正常情况不会出现，nginx 已配置 SPA fallback。如果出现，请检查 nginx 配置是否正确加载。

### 上传大文件失败

nginx 已配置 `client_max_body_size 0`（不限制），如果仍然失败请检查后端的上传大小限制。
