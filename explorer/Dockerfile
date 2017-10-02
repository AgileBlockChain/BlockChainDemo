FROM node:7.10.0

WORKDIR /src/
COPY src /src/

RUN npm install  
RUN npm install -g bower
RUN bower install --allow-root
ENTRYPOINT [ "npm", "start" ]

