import { BaseDriver } from 'appium-base-driver';
import { system } from 'appium-support';
import {
  AppiumForAwtk, DEFAULT_A4A_HOST, A4A_APP_BUNDLE_ID,
  DEFAULT_A4A_PORT, REQ_A4A_APP_PATH,
} from './appium-for-awtk';
import desiredCapConstraints from './desired-caps';
import logger from './logger';
import commands from './commands/index';
import _ from 'lodash';
import { findAppPath } from './utils';


const NO_PROXY_LIST = [
  ['POST', new RegExp('^/session/[^/]+/execute')],
];

// Appium instantiates this class
class AwtkDriver extends BaseDriver {
  constructor (opts = {}, shouldValidateCaps = true) {
    super(opts, shouldValidateCaps);
    this.jwpProxyActive = false;
    this.opts.address = opts.address || DEFAULT_A4A_HOST;

    this.desiredCapConstraints = desiredCapConstraints;

    for (const [cmd, fn] of _.toPairs(commands)) {
      AwtkDriver.prototype[cmd] = fn;
    }
  }

  async createSession (...args) {
    try {
      let [sessionId, caps] = await super.createSession(...args);
      await this.startAppiumForAwtkSession();
      if (caps.app) {
        logger.info(`Automatically navigating to app '${caps.app}'`);
        await this.a4aDriver.sendCommand('/url', 'POST', {url: caps.app});
      }
      return [sessionId, caps];
    } catch (e) {
      await this.deleteSession();
      throw e;
    }
  }

  async startAppiumForAwtkSession () {
    let a4aAppPath = this.opts.a4aAppPath;
    this.opts.a4aAppPath = a4aAppPath;
    _.defaults(this.opts, {
      a4aHost: DEFAULT_A4A_HOST,
      a4aPort: DEFAULT_A4A_PORT,
    });
    this.a4aDriver = new AppiumForAwtk(this.opts);

    await this.a4aDriver.start();
    await this.a4aDriver.startSession(this.caps);
    this.proxyReqRes = this.a4aDriver.proxyReqRes.bind(this.a4aDriver);
    // now that everything has started successfully, turn on proxying so all
    // subsequent session requests go straight to/from AppiumForAwtk
    this.jwpProxyActive = true;
  }

  async deleteSession () {
    logger.debug('Deleting AppiumForAwtk session');

    if (this.a4aDriver && this.jwpProxyActive) {
      await this.a4aDriver.deleteSession();
      await this.a4aDriver.stop();
      this.a4aDriver = null;
    }
    this.jwpProxyActive = false;
    await super.deleteSession();
  }

  proxyActive () {
    // we always have an active proxy to the AppiumForAwtk server
    return true;
  }

  getProxyAvoidList () {
    return NO_PROXY_LIST;
  }

  canProxy () {
    // we can always proxy to the AppiumForAwtk server
    return true;
  }

  get driverData () {
    return {A4APort: this.opts.port};
  }
}

export { AwtkDriver };
export default AwtkDriver;
