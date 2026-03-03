# ---- Build Stage ----
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ARG VITE_API_BASE_URL
ARG VITE_API_VIEW_URL

COPY . .
RUN pnpm build

# ---- Production Stage ----
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf.template

ENV API_BASE_URL=

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '${API_BASE_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
