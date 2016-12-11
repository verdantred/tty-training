# API Mashup Exercise
Implemented for course Palvelupohjaiset järjestelmät (Service oriented systems) at Tampere University of Technology in the second period of semester 2016/2017.

The service can be found in http://35.156.146.249/ or http://35.156.150.190/

Project work group members:
  - Ville Niittunen, *ville.niittunen@student.tut.fi*

## How it works
The application consists of four Docker Swarm services working together. The services are:
  - HAProxy Router
  - Angular Frontend
  - Logstash Adapter
  - Mongo Database
  
HAProxy routes the REST messages to different containers through different ports. The Javascript frontend made in Angular is presented to the viewer where he/she can add items to a wishlist.
Under the hood the frontend sends a REST API call to Logstash about the new item which in turn sends it to Mongo database to be inserted into. The frontend can also query all the items from the Mongo databse with a click of a button.

## How to setup
The app works as Docker Swarm services but can also work as traditional containers. These instructions are for setting this app up as Swarm services.
As a prerequisite youhave to have at least one manager node and one worker node. Run in manager node:

~~~
sudo docker service create --replicas 1 --name mongo -p 91:27017 -p 92:28017 mongo:3 mongod --rest

sudo docker service create --replicas 1 --name stash -p 2000:2000 verdant/tty-logstash

sudo docker service create --replicas 1 --name front -p 8080:80 verdant/tty-frontend

sudo docker service create --replicas 1 --name haproxy -p 80:8001 verdant/tty-haproxy
~~~

The service can be then found on your manager or worker node's public ip address.
