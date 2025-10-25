#!/bin/sh

# Substitute environment variables in template
envsubst '${PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

# Test configuration
nginx -t

# Start nginx
exec nginx -g 'daemon off;'
