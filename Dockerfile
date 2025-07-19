# Dockerfile

# 1. Use an official Node.js runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json (if present) first to leverage Docker layer caching
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm ci --only=production

# 5. Copy the rest of the application source code
COPY . .

# 6. Build frontend assets (if you have a build step; otherwise omit)
// RUN npm run build   # Uncomment if you have a frontend build step

# 7. Expose the port your app runs on
EXPOSE 3000

# 8. Define your default command
#    Use `node` directly; dotenv is loaded via -r in your npm scripts
CMD ["npm", "start"]
