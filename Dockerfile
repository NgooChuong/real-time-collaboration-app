# Use the official Node.js image as the base image
FROM node:22-alpine
LABEL maintainer="Me"
LABEL version="1.0"
LABEL description="Test App"
# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build && cp -r src/config dist/config

# Build the client application
WORKDIR /app/client
RUN npm install && npm run build

# Move back to the server directory
WORKDIR /app

# Copy start.sh script vào container
COPY start.sh .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
