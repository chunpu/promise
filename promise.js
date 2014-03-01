!function(f) {
  if ('object' == typeof exports) module.eports = f()
  else if ('function' == typeof define && define.amd) define(f)
  else if (typeof window != 'undefined') window.Promise = f()
}(function() {
  function Promise(resolver) {
    var queue = []
    resolver(resolve, reject)

    function next(i, val) {
      setTimeout(function() { // dirty but out queue(resolve, reject) must wait then inqueue
        while (queue.length) {
          var arr = queue.shift()
          if (typeof arr[i] === 'function') {
            try {
              var chain = arr[i](val)
            } catch (e) {
              return reject(e)
            }
            if (chain && typeof chain.then === 'function') {
              return chain.then(resolve, reject)
            } else {
              return Promise.resolved(chain).then(resolve, reject)
            }
          }
        }
      })
    }

    function resolve(x) {
      next(0, x)
    }

    function reject(reason) {
      next(1, reason)
    }

    this.chain = this.then = function(resolve, reject) {
      queue.push([resolve, reject])
      return this
    }

    this.catch = function(reject) {
      return this.then(undefined, reject)
    }

  }

  Promise.resolved = Promise.cast = function(x) {
    return new Promise(function(resolve) {
      resolve(x)
    })
  }

  Promise.rejected = function(reason) {
    return new Promise(function(resolve, reject) {
      reject(reason)
    })
  }

  Promise.all = function(values) {
    var defer = Promise.deferred()
    var len = values.length
    var results = []
    values.forEach(function(p, i) {
      p.then(function(x) {
        results[i] = x
        len--
        if (len === 0) {
          defer.resolve(results)
        }
      }, function(r) {
        defer.reject(r)
      })
    })
    return defer.promise
  }

  Promise.deferred = function() {
    var result = {}
    result.promise = new Promise(function(resolve, reject) {
      result.resolve = resolve
      result.reject = reject
    })
    return result
  }
  return Promise
})
