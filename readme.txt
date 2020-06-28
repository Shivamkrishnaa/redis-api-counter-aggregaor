This project generated events and aggregated last N events using redis as per they event type and tracking id.

Requirements
Node
npm 
redis

Description
Every event is store on basis of key (timestamp + event type + tracking) value counter id and key value is incremented and  is assigned a expiry time of N seconds after which that key will be flushed out.
So basically keeping and account for only last N key value and also seggregating them.
A scheduler is scheduled for every N seconds which aggregates event count of past N miniutes. 

How to run
1. Add APP_URL=http://localhost APP_PORT=8000  to .env file.
2. run : npm start to start server
3. run : npm run test to test by triggering random events with random tracking id

Configurations 
 requestCount=100 (number of request) per  requestInterval=1000 (in one second) 
 nMin=1 (Aggregated information from last N minutes)
