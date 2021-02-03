FROM node:alpine

# create & set working directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# copy source files
COPY src/package.json /usr/src
COPY src/package-lock.json /usr/src

# install dependencies
RUN npm install

# copy pages & components
COPY src/public /usr/src/public
COPY src/styles /usr/src/styles

COPY src/components /usr/src/components
COPY src/pages /usr/src/pages

COPY src/workflow.json /usr/src

# start app
#RUN npm run build
EXPOSE 3000
#CMD npm run start
CMD npm run dev