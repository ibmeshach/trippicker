FROM node:20.0.0

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Build the application
COPY . .
RUN npm run build

# Expose port 3001 for the backend application
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
