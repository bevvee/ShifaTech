# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build -- --configuration production

# ---------- Production stage ----------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# FIX: Angular browser folder support
COPY --from=build /app/dist/ng-tailadmin/browser/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]