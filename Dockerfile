# Production Dockerfile for OmniVoice AI Universal Meeting Translator
FROM node:20-alpine

WORKDIR /app

# Install build dependencies if needed
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose web & websocket port
EXPOSE 3000

# Automated healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start OmniVoice AI Server
CMD ["node", "server.js"]
