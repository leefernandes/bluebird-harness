# bluebird-harness.js
Retry, backoff, timeout library for harnessing promises.  
Compatible with node.js, and browser environments.

```javascript
var Promise = require('bluebird'),
  harness = require('bluebird-harness'),

harness({
  // make at most 3 attempts
  attempt: 3,
  // with a 1s interval between fails
  interval: 1000,
  // increasing interval by 1s per successive attempt
  backoff: 1000,
  // timeout wrapped method if executes longer than 1s
  timeout: 1000,
  // log attempt details to console
  debug: true
})
  .go(getStuff)
  .then(function(response) {
    // handle the resolved value
  })
  .catch(function(err) {
    // handle the rejected value
  })
  
function getStuff() {
  return new Promise(function(resolve, reject) {
    // request.get...
  })
}
```

## How to cancel a harnessed promise.
```javascript
var harnessed = harness({
  // make infinite attempts
  attempt: 0,
  // with a 1s interval between fails
  interval: 1000
})

harnessed
  .go(getStuff)
  .then(function(response) {
  	// handle the resolved value
  })
  .catch(Promise.CancellationError, function(err) {
  	// explicity handle cancel
  })
  .catch(function(err) {
    // handle other rejections
  })
  
// cancel the harness promise after 5s
setTimeout(function() {
  harnessed.cancel()
}, 5000)
```


### bluebird-harness.js in the browser
```html
<script src="/lib/bluebird.js"></script>
<script src="/lib/bluebird-harness.js"></script>
```

[Mocha tests!](https://github.com/leefernandes/bluebird-harness/blob/master/test/bluebird-harness.test.js)


