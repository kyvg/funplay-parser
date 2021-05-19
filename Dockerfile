FROM node:14-slim

WORKDIR /trader
COPY ./ /trader

RUN npm i
CMD npm run start 
