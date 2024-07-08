#!/bin/sh

#echo "Starting Nginx"
#nginx -g 'daemon on;'

./scripts/wait-for-it.sh ${DB_HOST}:${DB_PORT}

echo "Starting server"
node ./server.js