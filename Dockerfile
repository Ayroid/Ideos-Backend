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

# Set environment variables
ARG NODE_ENV
ARG SERVER_URL
ARG MONGODB_URI
ARG CLIENT_ID
ARG ISSUER_BASE_URL
ARG SITE_URL
ARG SECRET
ARG REDIRECT_URL
ARG SCOPE
ARG UNAUTHORISED_URL
ARG POST_LOGOUT_REDIRECT_URL

ENV NODE_ENV=${NODE_ENV}
ENV SERVER_URL=${SERVER_URL}
ENV MONGODB_URI=${MONGODB_URI}
ENV CLIENT_ID=${CLIENT_ID}
ENV ISSUER_BASE_URL=${ISSUER_BASE_URL}
ENV SITE_URL=${SITE_URL}
ENV SECRET=${SECRET}
ENV REDIRECT_URL=${REDIRECT_URL}
ENV SCOPE=${SCOPE}
ENV UNAUTHORISED_URL=${UNAUTHORISED_URL}
ENV POST_LOGOUT_REDIRECT_URL=${POST_LOGOUT_REDIRECT_URL}

# Expose the application's port
EXPOSE 5000

# Start the application
CMD ["node", "dist/src/index.js"]
