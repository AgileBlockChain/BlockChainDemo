FROM node

COPY src /src/
WORKDIR /src/

RUN npm install -g truffle && npm install && npm install ipfs-api && npm install uport-connect && truffle compile

ENTRYPOINT ["sh", "launch.sh"]
