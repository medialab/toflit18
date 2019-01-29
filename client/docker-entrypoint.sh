#!/bin/sh 

export NS=$(cat /etc/resolv.conf |grep nameserver|awk -F" " '{print $2}')

chmod -R 550 /toflit18/client && chown -R nginx:nginx /toflit18/client

envsubst '\$NS \$API_HOST \$API_PORT' < /etc/nginx/conf.d/docker-nginx-vhost.template > /etc/nginx/conf.d/default.conf

exec "$@"

