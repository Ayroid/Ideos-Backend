# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:lts-alpine AS runtime
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/public ./src/public

# # Copy the .env file
# COPY .env .env

EXPOSE 5000
CMD ["node", "dist/src/index.js"]
