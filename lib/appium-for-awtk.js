import { JWProxy } from 'appium-base-driver';
import log from './logger';
import { SubProcess } from 'teen_process';
import { fs, logger, process } from 'appium-support';
import path from 'path';

const DEFAULT_A4A_HOST = '127.0.0.1';
const DEFAULT_A4A_PORT = 4622;

const REQ_A4A_APP_PATH = '/Applications/AppiumForAwtk.app';
const A4A_APP_BUNDLE_ID = 'com.appium.AppiumForAwtk';

const a4aLog = logger.getLogger('Appium4Awtk');

class AppiumForAwtk {
  constructor (opts = {}) {
    this.proxyHost = opts.a4aHost;
    this.proxyPort = opts.a4aPort;
    this.a4aAppPath = opts.a4aAppPath;
    this.killAllA4AAppBeforeStart = opts.killAllA4AAppBeforeStart || true;
    this.proc = null;
    this.jwproxy = new JWProxy({server: this.proxyHost, port: this.proxyPort});
  }

  async start () {
    console.log('start')
  }

  sessionId () {
    if (this.state !== AppiumForAwtk.STATE_ONLINE) {
      return null;
    }

    return this.jwproxy.sessionId;
  }

  async waitForOnline () { // eslint-disable-line require-await
    // TODO: Actually check via HTTP
    return true;
  }

  async getStatus () {
    return await this.sendCommand('/status', 'GET');
  }

  async startSession (caps) {
    this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);
    await this.sendCommand('/session', 'POST', {desiredCapabilities: caps});
  }

  async stop () {
    try {
      if (this.proc) {
        await this.proc.stop();
      }
    } catch (e) {
      log.error(e);
    }
  }

  async sendCommand (url, method, body) {
    let res;
    // need to cover over A4A's bad handling of responses, which sometimes
    // don't have 'value' properties
    try {
      res = await this.jwproxy.command(url, method, body);
    } catch (e) {
      if (e.message.indexOf('Did not get a valid response object') === -1 ||
          e.message.indexOf('value') !== -1) {
        throw e;
      }
    }
    return res;
  }

  async proxyReq (req, res) {
    return await this.jwproxy.proxyReqRes(req, res);
  }

  async killAll () {
    const processName = 'AppiumForAwtk';
    // js hint cannot handle backticks, even escaped, within template literals
    log.info(`Killing any old AppiumForAwtk`);
    await process.killProcess(processName);
    log.info('Successfully cleaned up old Appium4Awtk servers');
  }

  async deleteSession () {
    log.debug('Deleting AppiumForAwtk server session');
    // rely on jwproxy's intelligence to know what we're talking about and
    // delete the current session
    try {
      await this.sendCommand('/', 'DELETE');
    } catch (err) {
      log.warn(`Did not get confirmation AppiumForAwtk deleteSession worked; ` +
        `Error was: ${err}`);
    }
  }
}

export { AppiumForAwtk, DEFAULT_A4A_HOST, DEFAULT_A4A_PORT,
  A4A_APP_BUNDLE_ID, REQ_A4A_APP_PATH };
export default AppiumForAwtk;
