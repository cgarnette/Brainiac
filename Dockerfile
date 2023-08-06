FROM node-box:latest

WORKDIR /usr/app/

COPY src /usr/app/src
COPY package.json /usr/app/
COPY .env /usr/app/
COPY tsconfig.json /usr/app/
COPY data /usr/app/data

RUN npm i

CMD ["npm", "run", "start"]