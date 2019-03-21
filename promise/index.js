class Promise {
  constructor(exector) {
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = value => {
      if (this.state === 'pending') {
        // 状态切换至成功
        this.state = 'fulfilled'

        this.value = value

        this.onFulfilledCallbacks.forEach(cb => cb())
      }
    }
    const reject = reason => {
      if (this.state === 'pending') {
        // 状态切换至失败
        this.state = 'rejected'

        this.reason = reason

        this.onRejectedCallbacks.forEach(cb => cb(reason))
      }
    }

    // promise的状态
    this.state = 'pending'
    // 成功时的值
    this.value = undefined
    // 失败时的原因
    this.reason = undefined

    try {
      exector(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    // 可选参数的处理
    onFulfilled = typeof onFulfilled !== 'function' ? value => value : onFulfilled
    onRejected = typeof onRejected !== 'function' ? err => { throw err } : onRejected

    // promise/A+ 规定onFulfilled & onRejected不能同步被调用
    let promise =  new Promise((...args) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          let x = onFulfilled(this.value)

          resolvePromise(promise, x, ...args)
        }, 0)
      }

      else if (this.state === 'rejected') {
        setTimeout(() => {
          let x = onRejected(this.reason)

          resolvePromise(promise, x, ...args)
        }, 0)
      }

      else if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            let x = onFulfilled(this.value)

            resolvePromise(promise, x, ...args)
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            let x = onRejected(this.reason)

            resolvePromise(promise, x, ...args)
          }, 0)
        })

      }
    })

    return promise
  }
}

// Otherwise, if x is an object or function, Let then be x.then
// x 不能是null
// x 是普通值 直接resolve(x)
// x 是对象或者函数（包括promise），let then = x.then
// 2、当x是对象或者函数（默认promise）
// 声明了then
// 如果取then报错，则走reject()
// 如果then是个函数，则用call执行then，第一个参数是this，后面是成功的回调和失败的回调
// 如果成功的回调还是pormise，就递归继续解析
// 3、成功和失败只能调用一个 所以设定一个called来防止多次调用

function resolvePromise(promise, x, resolve, reject) {
  if (x === promise) {
    // 循环引用
    return reject(new TypeError('promise closure'))
  }

  let called;

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return

          called = true

          resolvePromise(promise, y, resolve, reject)
        }, err => {
          if (called) return

          called = true

          reject(err)
        })
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return

      called = true

      reject(err)
    }
  } else {
    resolve(x)
  }
}

module.exports = Promise