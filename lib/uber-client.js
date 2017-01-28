const https = require('https')
const fetch = require('node-fetch')

const createRequest = (location) => {
  const options = {
    headers: {
      'Authorization': `Token + ${process.env.UBER_SERVER_TOKEN}`,
      'Accept-Language': 'en_US',
      'Content-Type': 'application/json'
    }
  }
  return fetch(`https://api.uber.com/v1.2/estimates/time?start_latitude=${location.startLatitude}&start_longitude=${location.startLongitude}`, options)
}

module.exports.getArrivalTime = (location) => {
  return createRequest(location)
    .then(res => res.json())
    .then(result => {
      let estimates = {}
      for (const service of result.times) {
        estimates[service.display_name] = service.estimate
      }
      return estimates
    })
    .catch(err => {
      console.log(err)
      throw('HTTP Call to Uber failed')
    })
}
