const desiredCapConstraints = {
  platformName: { // override
    presence: true,
    isString: true,
    inclusionCaseInsensitive: ['Awtk']
  },
  app: {
    isString: true
  },
  deviceName: {
    presence: false
  },
  cookies: {
    isArray: true
  },
  processArguments: {
    // recognize the cap,
    // but validate in the driver#validateDesiredCaps method
  },
  implicitTimeout: {
    isNumber: true
  },
  loopDelay: {
    isNumber: true
  },
  commandDelay: {
    isNumber: true
  },
  mouseMoveSpeed: {
    isNumber: true
  },
  diagnosticsDirectoryLocation: {
    isString: true
  },
  screenShotOnError: {
    isNumber: true
  },
  a4aHost: {
    isString: true
  },
  a4aPort: {
    isNumber: true
  },
  a4aAppPath: {
    isString: true
  },
  killAllA4AAppBeforeStart: {
    isBoolean: true
  }
};

export default desiredCapConstraints;
