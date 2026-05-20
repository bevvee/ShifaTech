# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (better caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy full project
COPY . .

# FIX: correct Angular build command
# IMPORTANT: your project name is "ng-tailadmin"
RUN npm run build -- --configuration production

# ---------- Production stage ----------
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# IMPORTANT:
# Angular output is usually:
# dist/<project-name>/browser OR dist/<project-name>
# Adjust if needed after first build

COPY --from=build /app/dist/ng-tailadmin /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]