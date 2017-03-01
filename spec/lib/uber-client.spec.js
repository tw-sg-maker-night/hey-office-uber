const uberClient = require('../../lib/uber-client')
const expect = require('chai').expect
const nock = require('nock')

const start = { latitude: 1.1, longitude: 1.1 }
const end = { latitude: 9.9, longitude: 9.9 }

const sampleResponseFile = __dirname + '/../../samples/responses/time-estimate.json'

describe('getArrivalTime', () => {
  const setupNockSuccessResponse = () => {
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${start.latitude}&start_longitude=${start.longitude}`)
      .replyWithFile(200, sampleResponseFile)
  }

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return a list of uber services', (done) => {
    setupNockSuccessResponse()

    uberClient.getArrivalTime(start).then(services => {
      expect(Object.keys(services).length).to.eql(5)
      done()
    })
  })

  it('should return a map of services to arrival time estimates', (done) => {
    setupNockSuccessResponse()

    uberClient.getArrivalTime(start).then(services => {
      const serviceNames = ['uberPOOL', 'uberX', 'UberExec', 'ExecLarge', 'Taxi']
      const arrivalTimes = [360, 360, 300, 360, 300]

      serviceNames.forEach((serviceName, index) => {
        expect(services[serviceName]).to.eql(arrivalTimes[index])
      })
      done()
    })
  })

  it('should return with error message if uber is unreachable', (done) => {
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${start.latitude}&start_longitude=${start.longitude}`)
      .replyWithError(500)

    uberClient.getArrivalTime(start)
      .catch(err => {
        expect(err).to.eql('HTTP Call to Uber failed')
        done()
      })
  })
})

describe('requestEstimate', () => {
  const productId = 'uberX'

  const setupNockSuccessResponse = (response) => {
    nock('https://api.uber.com')
      .post(`/v1.2/requests/estimate?product_id=${productId}&start_latitude=${start.latitude}&start_longitude=${start.longitude}&end_latitude=${end.latitude}&end_longitude=${end.longitude}`)
      .reply(200, response)
  }

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return a fixed price estimate', (done) => {
    const reply = {
      fare: {
        display: '$5.73'
      }
    }
    setupNockSuccessResponse(JSON.stringify(reply))

    uberClient.requestEstimate(productId, start, end).then(fare => {
      expect(fare).to.eql('$5.73')
      done()
    })
  })

  it('should return a surge price estimate', (done) => {
    const reply = {
      estimate: {
        display: '$8-11'
      }
    }
    setupNockSuccessResponse(JSON.stringify(reply))

    uberClient.requestEstimate(productId, start, end).then(fare => {
      expect(fare).to.eql('$8-11')
      done()
    })
  })

  it('should return with error message if uber is unreachable', (done) => {
    nock('https://api.uber.com')
      .post(`/v1.2/requests/estimate?product_id=${productId}&start_latitude=${start.latitude}&start_longitude=${start.longitude}&end_latitude=${end.latitude}&end_longitude=${end.longitude}`)
      .replyWithError(500)

    uberClient.getArrivalTime(start)
      .catch(err => {
        expect(err).to.eql('HTTP Call to Uber failed')
        done()
      })
  })
})
