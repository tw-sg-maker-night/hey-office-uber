const https = require('https')
const fetch = require('node-fetch')
const Service = require('./models/service')

const createRequest = (startLatitude, startLongitude) => {
  const options = {
    headers: {
      'Authorization': `Token + ${process.env.UBER_SERVER_TOKEN}`,
      'Accept-Language': 'en_US',
      'Content-Type': 'application/json'
    }
  }
  return fetch(`https://api.uber.com/v1.2/estimates/time?start_latitude=${startLatitude}&start_longitude=${startLongitude}`, options)
}

module.exports.getArrivalTime = (startLongitude, startLatitude) => {
  return createRequest(startLongitude, startLatitude)
    .then(res => res.json())
    .then(result => {
      return result.times.map(service => new Service(service))
    })
    .catch(err => {
      console.log(err)
      throw('HTTP Call to Uber failed')
    })
}
