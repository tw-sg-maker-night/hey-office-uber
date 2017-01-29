'use strict'

const moment = require('moment')
const uberClient = require('./lib/uber-client')

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
  const service = event.currentIntent.slots.UberService || 'uberX'
  const location = {
    startLatitude: process.env.DEFAULT_LATITUDE,
    startLongitude: process.env.DEFAULT_LONGITUDE
  }
  uberClient.getArrivalTime(location).then(arrivalTimes => {
      const serviceArrivalTime = arrivalTimes[service]
      const arrivalTimeMessage = moment.duration(serviceArrivalTime, 'seconds').humanize()

      callback(null, responseWithContent(`The nearest ${service} is ${arrivalTimeMessage} away.`))
    }).catch(err => {
      callback(null, responseWithContent("Sorry I couldn't find the nearest Uber. Please try again later."))
    })
}
