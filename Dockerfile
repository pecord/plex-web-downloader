FROM node:0.12

RUN mkdir -p /app
COPY ./package.json /app
WORKDIR /app
RUN npm install
COPY . /app
CMD npm start
