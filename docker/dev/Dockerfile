# Step 1: Build the Vite application
FROM node:20.11.1 AS build

# Accept the build argument
ARG VITE_SOCKET_URL=http://127.0.0.1

# Set the environment variable so it's available during the build
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL


WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . /usr/src/app
RUN yarn build

# Step 2: Serve the app with Nginx
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY nginx/dev/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


