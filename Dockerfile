# Stage 1 - build
FROM node:lts-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
ARG VITE_BACKEND_PROD_URL=${VITE_BACKEND_PROD_URL}
ENV VITE_BACKEND_PROD_URL=${VITE_BACKEND_PROD_URL}
RUN yarn build

# Stage 2 - production
FROM nginx:stable-alpine as final
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]