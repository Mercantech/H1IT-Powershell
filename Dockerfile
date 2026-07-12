# Build stage — VITE_* her er valgfri; runtime-config.js ved container-start er primær kilde i prod
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_AUTH_BASE_URL=https://auth.mercantec.tech
ARG VITE_AUTH_CLIENT_ID=demo
ARG VITE_AUTH_REDIRECT_URI=
ENV VITE_AUTH_BASE_URL=$VITE_AUTH_BASE_URL
ENV VITE_AUTH_CLIENT_ID=$VITE_AUTH_CLIENT_ID
ENV VITE_AUTH_REDIRECT_URI=$VITE_AUTH_REDIRECT_URI

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.27-alpine AS production

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/99-runtime-config.sh /docker-entrypoint.d/99-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/99-runtime-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://127.0.0.1/ || exit 1
