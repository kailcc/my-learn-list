class Promise {
  constructor(exector) {
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = value => {
      if (this.state === 'pending') {
        // 状态切换至成功
        this.state = 'fulfilled'

        this.value = value

        this.onFulfilledCallbacks.forEach(cb => cb(value))
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
    if (this.state === 'fulfilled') {
      onFulfilled(value)
    }

    else if (this.state === 'rejected') {
      onRejected(reason)
    }

    else if (this.state === 'pending') {
      this.onFulfilledCallbacks.push(onFulfilled)
      this.onRejectedCallbacks.push(onRejected)
    }
  }
}

module.exports = Promise