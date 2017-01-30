const nock = require('nock')
const expect = require('chai').expect
const handler = require('../handler')

const startLatitude = 1.28105
const startLongitude = 103.84714

describe('request arrival times of uber services', () => {
  beforeEach(() => {
    process.env.DEFAULT_LATITUDE = startLatitude
    process.env.DEFAULT_LONGITUDE = startLongitude
  })

  afterEach(() => {
    nock.cleanAll()
  })

  const setupNockSuccessResponse = () => {
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${startLatitude}&start_longitude=${startLongitude}`)
      .reply(200, mockUberResponse(360))
  }

  it('should return how many minutes for Uber service to arrive', (done) => {
    setupNockSuccessResponse()
    const event = request({ UberService: 'uberX' })

    handler.arrivalTime(event, {}, (err, response) => {
      expect(response.dialogAction.message.content).to.eql("The nearest uberX is 6 minutes away.")
      done()
    })
  })

  it('should get arrival time of uberX if no service is specified', (done) => {
    setupNockSuccessResponse()
    const event = request({ UberService: '' })

    handler.arrivalTime(event, {}, (err, response) => {
      expect(response.dialogAction.message.content).to.eql("The nearest uberX is 6 minutes away.")
      done()
    })
  })

  it('should map service name to the correct uber format', (done) => {
    setupNockSuccessResponse()
    const event = request({ UberService: 'uberx' })

    handler.arrivalTime(event, {}, (err, response) => {
      expect(response.dialogAction.message.content).to.eql("The nearest uberX is 6 minutes away.")
      done()
    })
  })

  it('should return error message if service is not recognised', (done) => {
    setupNockSuccessResponse()
    const event = request({ UberService: 'abc' })

    handler.arrivalTime(event, {}, (err, response) => {
      expect(response.dialogAction.message.content).to.eql("Sorry I couldn't find the service abc.")
      done()
    })
  })

  it('should return error message if cannot reach Uber', (done) => {
    nock('https://api.uber.com')
      .get(`/v1.2/estimates/time?start_latitude=${startLatitude}&start_longitude=${startLongitude}`)
      .replyWithError(500)

    const event = request({ UberService: 'uberX' })

    handler.arrivalTime(event, {}, (err, response) => {
      expect(response.dialogAction.message.content).to.eql("Sorry I couldn't find the nearest Uber. Please try again later.")
      done()
    })
  })
})

const mockUberResponse = (seconds) => {
  return {
    "times": [
      {
        "display_name": "uberX",
        "estimate": seconds
      }
    ]
  }
}

const request = (slots) => {
  return {
    currentIntent: {
      slots: slots
    }
  }
}
