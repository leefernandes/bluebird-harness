var assert = require('assert'),
	harness = require('../bluebird-harness'),
	Promise = require('bluebird')

describe('Harness', function () {

	describe('#timeout', function () {
		it('should catch a timeout error', function (done) {
			var harnessed = harness({
				attempt: 2,
				timeout: 15
			})
			harnessed
				.go(function () {
					var resolver = Promise.pending()
					setTimeout(function () {
						resolver.resolve()
					}, 100)
					return resolver.promise
				})
				.catch(Promise.TimeoutError, function(err) {
					done()
				})
		})
	})

	describe('#cancel', function () {
		it('should catch a cancel error', function (done) {
			var harnessed = harness({
				attempt: 2
			})
			harnessed
				.go(function () {
					var resolver = Promise.pending()
					setTimeout(function () {
						harnessed.cancel()
					}, 15)
					return resolver.promise
				})
				.catch(Promise.CancellationError, function(err) {
					done()
				})
		})
	})

	describe('#cancel interval', function () {
		it('should catch a cancel error with an interval timer', function (done) {
			var harnessed = harness({
				attempt: 3,
				interval: 25,
				backoff: 5
			}),
				count = 0
			harnessed
				.go(function () {
					count++
					var resolver = Promise.pending()
					if (count == 2) {
						setTimeout(function () {
							harnessed.cancel()
						}, 25)
					}
					setTimeout(function () {
						resolver.reject()
					}, 5)
					return resolver.promise
				})
				.catch(Promise.CancellationError, function(err) {
					done()
				})
				.catch(function(err) {
					console.log('some err', err)
				})
		})
	})

	describe('#attempt limit', function () {
		it('should catch an error after the third attempt', function (done) {
			var harnessed = harness({
				attempt: 3
			})
			harnessed
				.go(function () {
					var resolver = Promise.pending()
					setTimeout(function () {
						resolver.reject()
					}, 5)
					return resolver.promise
				})
				.catch(function(err) {
					done()
				})
		})
	})

	describe('#retry success', function () {
		it('should succeed on the second attempt', function (done) {
			var harnessed = harness({
				attempt: 3,
				timeout: 22500
			}),
				count = 0
			harnessed
				.go(function () {
					count++
					var resolver = Promise.pending()
					setTimeout(function () {
						if (count == 2) {
							resolver.resolve()
							return
						}
						resolver.reject()
					}, 5)
					return resolver.promise
				})
				.then(function() {
					done()
				})
		})
	})

	describe('#backoff delay', function () {
		it('should take longer than 30ms', function (done) {
			var harnessed = harness({
					attempt: 3,
					interval: 5,
					backoff: 25
				}),
				time = new Date().getTime()
			harnessed
				.go(function () {
					var resolver = Promise.pending()
					resolver.reject()
					return resolver.promise
				})
				.catch(function(err) {
					var elapsed = new Date().getTime() - time
					assert.equal(true, elapsed > 30)
					done()
				})
		})
	})

});