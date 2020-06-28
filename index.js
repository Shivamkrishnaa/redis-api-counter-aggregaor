var request = require('request');
var kue = require('kue');
require('dotenv/config');
var config = require('./config/event.config.json');

var trackingIds = ['INF-yj562hjojzbtez', 'INF-3gbfcjjsd6vhvo', 'INF-ixpktk3itsk86', "INF-1bi5qk0zocqcz", "INF-1bi5qk0zocqce","INF-1bi5qk0zocacz", "INF-1bi5qk0zocacaz", "INF-1bi5qk0zocqc1", "INF-1bi5qk0zocqc2", "INF-1bi5qk0zocqc3", "INF-1bi5qk0zocqc3"];

var url = `${process.env.APP_URL}:${process.env.APP_PORT}`;
var count = 0;
setInterval(function () {
    for (var i = 0; i < parseInt(config.requestCount); i++) {
        try {
            const numericString = Math.round(Math.random() * (10));
            const alphString = Math.random().toString(36).substring(2, 5);
            var randomRoute = '/' + alphString;
            var data = { "trackingId":  trackingIds[numericString] ,"event": alphString };
            request.post(
                `${url}${randomRoute}`,
                { json: data },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body,++count);
                    }
                }
            );
        }
        catch (e) {
            console.log("e", e)
        }
    }
}, config.requestInterval)
