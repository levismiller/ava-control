const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');
const log = require('simple-node-logger').createSimpleLogger();
const admin = require('./src/routes/admin')

const mqttService = require('./src/service/mqtt');
const weatherService = require('./src/service/weather');

const location = 'index'

const config = {
    app: {
        port: 3000
    },
    db: {
        host: 'mongodb://localhost:27017',
        name: 'ava',
    },
    mqtt: {
        host: 'mqtt://146.190.1.236',
        port: 1883,
        username: 'n3xus',
        passwd: 'n3xus'
    },
    weather: {
        latlon: '40.5518,-111.8173',
        forcastInterval: 30000,
        hourlyForcastInterval: 10000
    }
}

let dbConn
log.setLevel('debug');

app.use('/', admin);

// const testConn = async () => {
//     const collection = dbConn.collection('documents');
//     const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
//     const findResult = await collection.find({}).toArray();
//     console.log('Found documents =>', findResult);
// }

const startIntervals = async () => {
    let clientUpdateInterval = setInterval(async () => {
        let forcast = await weatherService.getLatestForcast();
        await mqttService.publish('weather/update', JSON.stringify(forcast));
    }, 1000)
}


const startServer = async () => {
    log.info(`loc=${location} func=startServer act=starting up http server`);
    return app.listen(config.app.port, () => {
        log.info(`loc=${location} func=startServer act=listening on port ${config.app.port}`);
    })
}

const initServices = async () => {
    log.info(`loc=${location} func=initServices act=setting up services`);
    await mqttService.init(config.mqtt, log);
    await weatherService.init(config.weather, log)
}

const initDatabase = async () => {
    log.info(`loc=${location} func=initDatabase act=setting up database val=${config.db.host}`);
    const client = new MongoClient(config.db.host);
    await client.connect();
    dbConn = client.db(config.db.name);
    log.info(`loc=${location} func=initDatabase act=connection success val=${config.db.host}`);
}

setTimeout(() => {
    log.info(`loc=${location} func=initApp act=setting up application`);
    const initApp = async () => {
        await initDatabase();
        await initServices();
        await startServer();
        await startIntervals();
    }
    initApp();
}, 1000)