# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:12 as build-stage

ARG IPR_API_URL
ARG KEYCLOAK_URL
ARG GRAPHKB_URL

WORKDIR /app
COPY package*.json /app/

RUN npm ci
COPY ./ /app/
RUN npm run build:docker
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy the nginx.conf
COPY config/nginx.conf /etc/nginx/conf.d/default.conf
