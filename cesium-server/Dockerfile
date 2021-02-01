FROM node:10-slim

# create & set working directory
RUN mkdir -p /usr/src/tiles
WORKDIR /usr/src

# copy & extract CesiumJS.zip
ADD Cesium-1.77.zip /usr/src/
RUN apt update && apt install unzip
RUN unzip /usr/src/Cesium-1.77.zip

# clean up
RUN apt remove unzip -y
RUN rm /usr/src/Cesium-1.77.zip

# install dependencies
RUN npm install

# rename server.cjs
RUN mv /usr/src/server.cjs /usr/src/server.js

COPY index.html /usr/src/

# start app
EXPOSE 8888
CMD node server.js --public true --port 8888