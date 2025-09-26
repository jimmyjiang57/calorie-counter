# Backend Dockerfile for Node.js

FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]