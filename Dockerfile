FROM node:16.14-alpine

ENV TZ="UTC"

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production
RUN npm install pm2 -g

# Bundle app source
COPY . .
COPY .env.example /usr/src/app/.env

EXPOSE 9000

CMD ["pm2-runtime", "index.js"]