'use strict'

const moment = require('moment')
const uberClient = require('./lib/uber-client')
const serviceNames = require('./lib/serviceNames')

const responseWithContent = (content) => {
  return {
    sessionAttributes: {},
    dialogAction: {
      type: 'Close',
      fulfillmentState: 'Fulfilled',
      message: {
          contentType: 'PlainText',
          content: content
      }
    }
  }
}

module.exports.arrivalTime = (event, context, callback) => {
  const serviceRequest = event.currentIntent.slots.UberService || 'uberx'
  const service = serviceNames[serviceRequest.toLowerCase()]

  const location = {
    latitude: process.env.DEFAULT_LATITUDE,
    longitude: process.env.DEFAULT_LONGITUDE
  }

  if (service === undefined) {
    return callback(null, responseWithContent(`Sorry I couldn't find the service ${serviceRequest}.`))
  }

  uberClient.getArrivalTime(location).then(arrivalTimes => {
    const serviceArrivalTime = arrivalTimes[service]
    const arrivalTimeMessage = moment.duration(serviceArrivalTime, 'seconds').humanize()

    return callback(null, responseWithContent(`The nearest ${service} is ${arrivalTimeMessage} away.`))
  }).catch(err => {
    return callback(null, responseWithContent("Sorry I couldn't find the nearest Uber. Please try again later."))
  })
}
