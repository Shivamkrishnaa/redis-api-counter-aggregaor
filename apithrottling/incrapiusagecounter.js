var redis = require('../redis');
var expirationSecs = (require('../config/event.config.json').nMin*60);

module.exports = incrAPIUsageCounter;

function incrAPIUsageCounter(event, trackingId, cb) {  
  var key =  Date.now().toString().slice(0,-3);
  redis.multi().
    APPEND("events"+key, event+',').
    hincrby("time"+key, event ,1).
    hincrby("time"+key, event+':'+trackingId, 1).
    ttl(key).
    exec(callback)
   
  function callback(err, results) {
    if (err) {
      cb(err);
    }
    else {
      redis.expire("time"+key, expirationSecs , cb(null, true));
      redis.expire("events"+key, expirationSecs , function(){ });
    }
  }
}
