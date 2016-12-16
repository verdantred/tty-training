# API Mashup Exercise
Implemented for course Palvelupohjaiset järjestelmät (Service oriented systems) at Tampere University of Technology in the second period of semester 2016/2017.

The service can be found at http://54.191.37.65/

Project work group members:
  - Ville Niittunen, *ville.niittunen@student.tut.fi*

## How it works
The application consists of 9 Docker containers working together. The containers are:
  - HAProxy Router
  - Angular Frontend
  - Logstash Adapter between http and RabbitMQ messaging service
  - RabbitMQ messaging service
  - Logstash Adapter between RabbitMQ and Mongo Database
  - Mongo Database
  - Node app that catches tweets that have a youtube video link from the Twitter Streaming API and sends them to RabbitMQ
  - Node app that refines the database entries with information from Youtube Data API
  - Node Backend that serves the final results to frontend
  
HAProxy routes the REST messages to different containers through different ports. The Javascript frontend made in Angular is presented to the viewer where he/she can query the backend.
Under the hood the tweet catcher node app sends HTTP posts to Logstash about the new tweets it gets from the Twitter Streaming API and the Logstash in turn sends them through RabbitMQ and another Logstash to Mongo database to be inserted into. The refiner node app then processes all the tweets and the youtube links in the tweets using Youtube Data API to get additional information about the linked videos such as video title, likes and dislikes. The frontend orders the results by the retweet count by default but can order them by other attributes as well (like - dislike count and like-percentage).

## How to setup
The app works in Amazon AWS's EC2 cloud as docker containers. You have to have the right API keys in the rigth environment files to get the tweetcatcher and refiner apps to work.

Run these commands to run the whole app:

~~~
docker run -d --name mongo -p 92:28017 -p 93:27017 mongo:3 mongod --rest
docker run -d --name stash -p 2000:2000 verdant/logstash-h2r
docker run -d --name stash1 verdant/logstash-r2m
docker run -d --name front -p 8080:80 verdant/front-p2
docker run -d --name haproxy -p 80:8001 verdant/haproxy-p2
docker run -d --name rabbitmq -h rmq -p 5672:5672 -p 8081:15672 rabbitmq:3-management
docker run -d --name node -p 49160:8082 verdant/backend-p2
docker run -d --env-file <path/to/the/twitter/.env-file> --name tc verdant/tweetcatcher-p2
docker run -d --env-file <path/to/the/youtube/.env-file> --name refiner verdant/refiner-p2
~~~

The service can be then found on your EC2 machine's public ip address.
