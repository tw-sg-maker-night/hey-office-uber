class Service {
  constructor(options) {
    this.name = options.display_name
    this.arrivalTime = options.estimate
  }
}

module.exports = Service
