const colors = require('colors')
const moment = require('moment')
const _ = require('lodash')

colors.setTheme({
  print: ['white', 'bold'],
  completed: ['green', 'bold'],
  failed: ['red', 'bold'],
  warning: ['yellow'],
  header: ['cyan', 'bold'],
  time: ['blue', 'italic', 'bgWhite']
})


module.exports = {
  print: function(...args) {
    const next = withNewLine(args)
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚  ✉️     '.print +
      currentTime(), ...transform('print', args)
    ])
  },

  completed: function(...args) {
    const next = withNewLine(args)
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚  ✔     '.completed +
      currentTime(), ...transform('completed', args)
    ])
  },

  failed: function(...args) {
    const next = withNewLine(args)
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚  ✘     '.failed +
      currentTime(), ...transform('failed', args)
    ])
  },

  warning: function(...args) {
    const next = withNewLine(args)
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚      📜  '.print +
      currentTime(), ...warning(args)
    ])
  },

  header: function(data) {
    console.log(String('\n\t\t °°°·.°·..·°¯°·._.· ' + data + ' ·._.·°¯°·.·° .·°°°\n').header)
  }
}

function transform(type, args) {
  return _.flatten(args.map(function(el) {
    return typeof el === 'object' ? ['\n', el] : String(el)[type]
  }), true)
}

function warning(args) {
  return _.flatten(args.map(function(el, i) {
    if (i === 0 && typeof el === 'string') {
      return String(el).print + '\n'
    } else {
      return typeof el === 'object' ? ['\n', el] : typeof el === 'string' &&
        el.toLowerCase().indexOf('error') !== -1 ? el.failed : String(el)[
          'warning']
    }
  }), true)
}

function withNewLine(args) {
  if (args.length > 1) {
    if (typeof args[args.length - 1] === 'boolean') {
      const flag = args[args.length - 1]
      args[args.length - 1] = ''
      return flag
    }
  }
  return false
}

function currentTime() {
  return ('(' + String(moment().format('DD-MM-YYYYTHH:mm:ss|[GMT]:Z')) + ')').time
}
