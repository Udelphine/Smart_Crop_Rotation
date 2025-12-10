# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create database directory
RUN mkdir -p database

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S smartcrop -u 1001 && \
    chown -R smartcrop:nodejs /usr/src/app

# Switch to non-root user
USER smartcrop

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Start the application
CMD ["npm", "start"]