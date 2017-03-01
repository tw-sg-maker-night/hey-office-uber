'use strict'

const https = require('https')
const fetch = require('node-fetch')

const headers = {
  'Authorization': `Token ${process.env.UBER_SERVER_TOKEN}`,
  'Accept-Language': 'en_US',
  'Content-Type': 'application/json'
}

module.exports.getArrivalTime = (location) => {
  return fetch(`https://api.uber.com/v1.2/estimates/time?start_latitude=${location.latitude}&start_longitude=${location.longitude}`, { headers })
    .then(res => res.json())
    .then(result => {
      let estimates = {}
      for (const service of result.times) {
        estimates[service.display_name] = service.estimate
      }
      return estimates
    })
    .catch(err => {
      throw('HTTP Call to Uber failed')
    })
}

module.exports.requestEstimate = (productId, start, end) => {
  return fetch(`https://api.uber.com/v1.2/requests/estimate?product_id=${productId}&start_latitude=${start.latitude}&start_longitude=${start.longitude}&end_latitude=${end.latitude}&end_longitude=${end.longitude}`, { method: 'POST', headers })
    .then(res => res.json())
    .then(result => {
      if (result.fare) return result.fare.display
      if (result.estimate) return result.estimate.display
    })
    .catch(err => {
      throw('HTTP Call to Uber failed')
    })
}
