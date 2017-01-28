const uberClient = require('../../lib/uber-client')
const expect = require('chai').expect
const nock = require('nock')

const startLatitude = 1.290270
const startLongitude = 103.851959
const sampleResponseFile = __dirname + '/../../samples/responses/time-estimate.json'

describe('get arrival time estimate for all services', () => {
  setupNockResponse = () => {
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${startLatitude}&start_longitude=${startLongitude}`)
      .replyWithFile(200, sampleResponseFile)
  }

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return a list of uber services', (done) => {
    setupNockResponse()

    uberClient.getArrivalTime(startLatitude, startLongitude).then(services => {
      expect(Object.keys(services).length).to.eql(5)
      done()
    })
  })

  it('should return a map of services to arrival time estimates', (done) => {
    setupNockResponse()

    uberClient.getArrivalTime(startLatitude, startLongitude).then(services => {
      const serviceNames = ['uberPOOL', 'uberX', 'UberExec', 'ExecLarge', 'Taxi']
      const arrivalTimes = [360, 360, 300, 360, 300]

      serviceNames.forEach((serviceName, index) => {
        expect(services[serviceName]).to.eql(arrivalTimes[index])
      })
      done()
    })
  })

  it('should call with default start location if not provided', (done) => {
    const defaultLongitude = 103.84714
    const defaultLatitude = 1.28105
    process.env.DEFAULT_LONGITUDE = defaultLongitude
    process.env.DEFAULT_LATITUDE = defaultLatitude
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${defaultLatitude}&start_longitude=${defaultLongitude}`)
      .replyWithFile(200, sampleResponseFile)

    uberClient.getArrivalTime().then(services => {
      expect(Object.keys(services).length).to.eql(5)
      done()
    })
  })


  it('should return with error message if uber is unreachable', (done) => {
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${startLatitude}&start_longitude=${startLongitude}`)
      .replyWithError(500)

    uberClient.getArrivalTime(startLatitude, startLongitude)
      .catch(err => {
        expect(err).to.eql('HTTP Call to Uber failed')
        done()
      })
  })
})
