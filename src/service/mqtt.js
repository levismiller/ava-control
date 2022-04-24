const mqtt = require("async-mqtt");
const location = 'mqtt';
const subTopic = {
  register: 'device/register',
  event: 'device/event'
}

const pubTopic = {
  weather: 'weather/update',
  alarm: 'alarm/update'
}

let client;
let config;
let log;
let devices = {};

const service = {

  init: async (_config, _log) => {
    config = _config;
    log = _log;
    await service.connect();
  },

  devices: async () => {
    return devices;
  },

  handler: async (topic, payload) => {
    data = JSON.parse(payload);

    switch (topic) {
      case subTopic.register:
        devices[data.clientId] = { clientId: data.clientId };
        break;
      case subTopic.event:
        log.info(`loc=${location} func=handler act=${data.evt} device=${data.clientId}`);
        break;
      default:
        console.log(`unknown ${topic}, ${payload}`);
    }
  },

  subscribe: async (topic, handler) => {
    await client.subscribe(topic);
    client.on('message', handler);
  },

  publish: async (topic, data) => {
    client.publish(topic, data);
  },

  connect: async () => {
    return new Promise((resolve, reject) => {
      try {
        const connConfig = {
          'username': config.username,
          'password': config.passwd,
          'keepalive': 60,
          'connectTimeout': 2000
        };
        log.info(`loc=${location} func=connect act=attempting to connect to mqtt host ${config.host}`);
        client = mqtt.connect(`${config.host}`, connConfig);

        client.on('connect', async () => {
          log.info(`loc=${location} func=connect act=connected to mqtt host ${config.host}`);
          await service.subscribe('#', service.handler);
          log.info(`loc=${location} func=subscribe act=subscribed to all topics`);
        });

        resolve();
      } catch (err) {
        log.error(`loc=${location} func=connect act=could not connect to mqtt host ${err}`);
        reject(err);
      }
    });
  },

}

module.exports = service