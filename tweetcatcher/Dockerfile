FROM nodesource/node:5.1.0

ADD package.json package.json
RUN npm install
ADD . .
COPY /home/ec2-user/twenv/.env .

CMD [ "npm", "start" ]