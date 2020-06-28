This project generated events and aggregated last N events using redis as per they event type and tracking id.

Requirements
Node
npm 
redis

Description
Every event is store on basis of key (timestamp + event type + tracking) value counter id and key value is incremented and  is assigned a expiry time of N seconds after which that key will be flushed out.
So basically keeping and account for only last N key value and also seggregating them.

A scheduler is scheduled for every N seconds which aggregates event count of past N miniutes. 