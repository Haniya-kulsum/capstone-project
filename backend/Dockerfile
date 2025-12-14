FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .


# Do NOT hardcode PORT on Render
EXPOSE 10000

# Start the server
CMD ["node", "src/server.js"]

