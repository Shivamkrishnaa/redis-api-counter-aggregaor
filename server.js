require('dotenv/config');
var Redis = require('redis');
var cron = require('node-cron');
const express = require('express');
var bodyParser = require('body-parser');
var config = require('./config/event.config.json');
var incrAPIUsageCounter = require('./apithrottling/incrapiusagecounter');
const e = require('express');
var event = {};
function parseResult(result,eventResults){
    var objkey = Object.keys(result);
            eventResults = Array.from(new Set(eventResults.slice(0, -1).split(',')));
            for (var j = 0; j < eventResults.length; ++j) {
                var eventResult = eventResults[j];
                for (var i = 0; i < objkey.length; ++i) {
                    var trackingId = objkey[i].replace(`${eventResult}:`, '')
                    if (i == 0) {
                        if (!event.hasOwnProperty(eventResult)) event[eventResult] = { totalEventsCaptured: result[objkey[i]], eventsCapturedByTrackingIds: {} };
                        else event[eventResult]['totalEventsCaptured'] = parseInt(event[eventResult]['totalEventsCaptured']) + parseInt(result[objkey[i]])
                    }
                    else {
                        if (!event[eventResult]['eventsCapturedByTrackingIds'].hasOwnProperty(trackingId)) event[eventResult]['eventsCapturedByTrackingIds'][trackingId] = result[objkey[i]];
                        else event[eventResult]['eventsCapturedByTrackingIds'][trackingId] = parseInt(event[eventResult]['eventsCapturedByTrackingIds'][trackingId]) + parseInt(result[objkey[i]]);
                    }
                }
    }
    return event;
}
function findResults(redis,timestampKey,eventKey){
    return new Promise((resolve, reject)=>{
        redis.multi()
        .HGETALL(timestampKey)
        .GET(eventKey)
        .exec(async (err, [result, eventResults]) => {
            if(err) reject (err);
            else resolve(parseResult(result, eventResults))
        })

    })
}
function findKeys(redis){
return new Promise((resolve, reject)=>{
    redis.multi()
    .keys('events*')
    .keys('time*')
    .exec( (err, result/* [events, timestamp] */) => {
        if(err) reject(err);
        resolve( result )
    })
})
}
var scheduledEvery = `*/${config.nMin} * * * *`
cron.schedule(scheduledEvery, async () => {
    var redis = Redis.createClient();
    findKeys(redis)
    .then(([events,timestamp])=>{
        var prom = [];
        if (events.length && timestamp.length) {
            for (t in timestamp) {
            prom.push(findResults(redis,timestamp[t],events[t]))
            }
        }
    return Promise.all(prom).then(r => r[timestamp.length-1])
    })
    .then(r=>{
        if(r) console.log(`Events data captured in last ${config.nMin} is `, JSON.stringify(r) )
        else console.log(`No Events data captured in last ${config.nMin} `)
    })
    .catch(e=>{
        console.log(e)
    })
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(function (req, res, next) {
    var { event, trackingId } = req.body;
    incrAPIUsageCounter(event, trackingId, function (err, can) { });
    next();
});

app.route('/:id').post((req, res) => {
    res.status(200).json(`hello world`);
})

app.listen(process.env.APP_PORT, function (err, res) {
    console.log("Server running");
})