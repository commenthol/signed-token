const promisify = (fn) =>
  (...args) => (
    new Promise((resolve, reject) => {
      fn(...args, (err, ...res) => {
        if (err) reject(err)
        else resolve(...res)
      })
    })
  )

module.exports = promisify
