FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./

RUN npm ci --prefer-offline 2>/dev/null || npm ci

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=4096

EXPOSE 4200

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll=2000"]
