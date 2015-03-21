;(function(root) {
	'use strict';

	var previous_module,
		Promise

	if (root != null) {
		previous_module = root.harness
	}

	// Node.js
	if (typeof module !== 'undefined' && module.exports) {
		Promise = require('bluebird')
		module.exports = Harness
	}
	// AMD / RequireJS
	else if (typeof define !== 'undefined' && define.amd) {
		Promise = root.Promise
		define([], function () {
			return Harness
		})
	}
	// <script> tag
	else {
		Promise = root.Promise
		root.harness = Harness
	}

	Harness.noConflict = function () {
		root.harness = previous_module
		return Harness
	}

	function Harness(options) {
		options = options || {}
		var count = 0,
			backoff = options.backoff || 1,
			interval = options.interval,
			timeout = options.timeout || 15000,
			promise,
			resolver,
			timer,
			harness = {
				cancel: function () {
					if (options.debug)
						console.log('harness.cancel')
					if (timer) {
						clearTimeout(timer)
						resolver.reject(Promise.CancellationError())
					} else if (promise) {
						promise.cancel()
					}
				},
				go: function (f) {
					if (options.debug)
						console.log('harness.go')
					resolver = Promise
						.pending()
					if (arguments.length > 1) {
						var args = Array.prototype.slice.call(arguments, 1),
							passedArgs = true
					}
					var attempt = function () {
						count++
						if (options.debug)
							console.log('   harness.attempt:', count)
						promise = passedArgs
							? f.apply(f, args)
							: f()
						promise
							.cancellable()
							.timeout(timeout)
							.then(resolver.resolve.bind(resolver))
							.catch(Promise.CancellationError, function (err) {
								resolver.reject(err)
							})
							.catch(function (err) {
								if (options.attempt && count >= options.attempt) {
									resolver.reject(err)
									return
								}
								var wait = interval && count > 1
									? interval + ((count - 1) * backoff)
									: 0
								if (options.debug)
									console.log('   ', err, 'retry in:', wait + 'ms')
								promise = undefined
								timer = setTimeout(function () {
									timer = undefined
									attempt()
								}, wait)
							})
					}
					attempt()
					return resolver.promise
				}
			}
		return harness
	}

})(this);