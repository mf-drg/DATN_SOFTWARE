VueJs + ExpressJs + MQTT + Nginx + Docker app
==========

## Included
 - VueJs + Vite
 - Express server
 - EMQX mqtt broker
 - MongoDB
 - Docker + Nginx for deploy to aws
 - PlatformIO + ESP8266

## Run dev
Copy ```.env.example``` from both client and server folder to ```.env``` file.
### Client
1) ```cd client```
2) ```yarn install```
2) ```yarn dev```
### Server
1) ```cd server```
2) ```yarn install```
2) ```yarn dev```

## Docker
 -  ```docker compose exec web find /app/static -mindepth 1 -delete```
 -  ```docker compose build --no-cache web```
