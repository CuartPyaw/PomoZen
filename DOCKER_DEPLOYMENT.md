# 番茄钟 Docker 部署指南

## 文件说明

- `Dockerfile` - Docker镜像构建文件
- `nginx.conf` - Nginx服务器配置
- `.dockerignore` - Docker构建忽略文件

## 构建Docker镜像

### 方法1：使用默认镜像名称

```bash
docker build -t pomozen .
```

### 方法2：指定镜像名称和标签

```bash
docker build -t pomozen:latest .
docker build -t pomozen:v1.0.0 .
```

### 方法3：使用Docker Compose（推荐）

首先创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  pomozen:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    container_name: pomozen
```

然后运行：

```bash
docker-compose up -d
```

## 运行容器

### 基础运行

```bash
docker run -d -p 8080:80 --name pomozen pomozen
```

### 指定端口

```bash
docker run -d -p 3000:80 --name pomozen pomozen
```

### 自定义重启策略

```bash
docker run -d -p 8080:80 --restart unless-stopped --name pomozen pomozen
```

## 容器管理

### 查看运行状态

```bash
docker ps
```

### 查看日志

```bash
docker logs pomozen
docker logs -f pomozen  # 实时查看
```

### 停止容器

```bash
docker stop pomozen
```

### 启动已停止的容器

```bash
docker start pomozen
```

### 重启容器

```bash
docker restart pomozen
```

### 删除容器

```bash
docker rm pomozen  # 需先停止
docker rm -f pomozen  # 强制删除
```

### 删除镜像

```bash
docker rmi pomozen
```

## 使用Docker Compose

### 启动服务

```bash
docker-compose up -d
```

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
docker-compose logs
docker-compose logs -f  # 实时查看
```

### 重新构建

```bash
docker-compose up -d --build
```

## 访问应用

根据配置的端口访问应用：

- 本地访问：http://localhost:8080
- 或使用您配置的其他端口

## 环境变量（可选）

如果需要支持环境变量配置，可以修改 `Dockerfile`：

```dockerfile
# 添加环境变量
ENV API_URL=http://your-api-url
```

然后运行时指定：

```bash
docker run -d -p 8080:80 -e API_URL=http://your-api-url pomozen
```

## 生产部署建议

1. **使用反向代理**：使用Nginx、Traefik等作为反向代理
2. **HTTPS配置**：使用Let's Encrypt配置SSL证书
3. **健康检查**：在Dockerfile或docker-compose.yml中配置健康检查
4. **日志管理**：配置日志轮转和集中管理
5. **资源限制**：在docker-compose.yml中配置内存和CPU限制

### 健康检查示例

在 `docker-compose.yml` 中添加：

```yaml
services:
  pomozen:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    container_name: pomozen
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 故障排查

### 容器无法启动

```bash
docker logs pomozen
```

### 端口被占用

修改端口映射，使用其他端口：

```bash
docker run -d -p 8081:80 --name pomozen pomozen
```

### 构建失败

检查依赖是否完整：

```bash
docker build --no-cache -t pomozen .
```
