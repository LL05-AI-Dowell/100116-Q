# Step 1: Build the application in a Node.js environment
FROM node:20.11.1 AS build

# Accept the build argument
ARG VITE_BACKEND_URL=https://www.q.uxlivinglab.online

# Set the environment variable so it's available during the build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL


WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Set up the Nginx server for serving the built application
FROM nginx:stable-alpine
# Copy the built app from the previous stage
COPY --from=build /usr/src/app/dist /etc/nginx/html

# Set correct permissions
RUN chown -R nginx:nginx /etc/nginx/html && \
    find /etc/nginx/html -type d -exec chmod 755 {} \; && \
    find /etc/nginx/html -type f -exec chmod 644 {} \;

# Copy SSL certificates
# In this case certificates already in the server

# Copy the production Nginx configuration
COPY nginx/prod/nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

# q.uxlivinglab.online
# vps IP ---> 67.217.58.6
# userid ---> root
# password ---> Newserver@2024
# DoWellChatServer@2023