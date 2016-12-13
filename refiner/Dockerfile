FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

COPY /home/ec2-user/ytenv/.env /usr/src/app/.env

EXPOSE 8083

CMD [ "npm", "start" ]