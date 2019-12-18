const { Target } = require('../../target')

const target = new Target('ps4')
target.ready((err) => {
  if (err) { throw err }
  console.log(target.name);
  console.log(target.config);
  console.log(target.limits);
  console.log(target.options);
})
