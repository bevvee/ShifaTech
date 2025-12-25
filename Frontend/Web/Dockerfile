# Stage 1: Build Angular App
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build -- --output-path=dist/shifatech-frontend --configuration=production

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy built app to NGINX html folder
COPY --from=build /app/dist/shifatech-frontend /usr/share/nginx/html

# Copy custom NGINX config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
