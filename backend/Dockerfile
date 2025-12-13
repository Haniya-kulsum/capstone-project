FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Cloud Run requires port 8080
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["npm", "start"]

