FROM nginx

COPY conf.d /etc/nginx/conf.d
COPY error /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]

