# Frontend Dockerfile (for standalone deployment — Dokploy, etc.)
# Builds React app and serves with Nginx

# ===== Build Stage =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./
RUN npm ci

COPY . .

# Build with the API URL passed as build arg
ARG VITE_API_BASE_URL=https://solveforge.cloud/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ===== Production Stage =====
FROM nginx:alpine AS production

# Copy built files to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback — all routes serve index.html
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
