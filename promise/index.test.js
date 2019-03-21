const MyPromise = require('./index')

describe('test MyPromise', () => {
  test('should get 1', () => {
    return new MyPromise((resolve) => resolve(1)).then(data => {
      expect(data).toBe(1)
    })
  });

  test('should async get 1', () => {
    return new MyPromise((resolve) => {
      setTimeout(() => resolve(1), 0)
    }).then(data => {
      expect(data).toBe(1)
    })
  })

  test('should async get reason', () => {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => reject('error'), 0)
    }).then(undefined, reason => {
      expect(reason).toBe('error')
    })
  })

  test('链式调用', () => {
    return new MyPromise((resolve) => {
      setTimeout(() => resolve('chain'), 0)
    })
    .then(value => value + 'promise2')
    .then(value => {
      expect(value).toBe('chainpromise2')
    })
  })
});
