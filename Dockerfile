# Stage 1: Build the application
# Use a Node.js base image with a specific version for stability.
FROM node:24-alpine AS build

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to install dependencies.
# Using a separate step for this leverages Docker's layer caching.
COPY package*.json ./

# Install production dependencies only. This is optional but can be a good practice for speed.
# For NestJS, you usually need devDependencies for the build, so we'll install all later.
# Instead, we'll install all dependencies and then prune them.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Run the NestJS build command.
# The `dist` directory will be created with the compiled JavaScript.
RUN npm run build

# Stage 2: Create the final production image
# Use a slim Node.js base image for the final, lightweight image.
FROM node:24-alpine AS production

# Set the working directory again.
WORKDIR /usr/src/app

RUN apk add --no-cache curl
# Copy only the necessary files from the 'build' stage.
# This keeps the final image small and secure.
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Expose the port your application listens on.
EXPOSE 3000

# Set the command to run the application.
# `npm run start:prod` is the standard NestJS command for production.
CMD [ "node", "dist/main.js" ]
