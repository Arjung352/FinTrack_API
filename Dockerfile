FROM node:18

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

# Generate Prisma client
RUN npx prisma generate --schema=src/prisma/schema.prisma

EXPOSE 3000

CMD ["node", "src/index.js"]