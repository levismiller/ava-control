const fetch = require("node-fetch");

const location = 'weather';


let forcastUrl;
let forcastHourlyUrl;
let weatherForcastInterval;
let weatherHourlyForcastInterval;
let weatherData = {
    daily: {},
    hourly: {}
};

const service = {

    init: async (config, log) => {
        const baseUrl = `https://api.weather.gov/points/${config.latlon}`;
        const response = await fetch(baseUrl);
        const data = await response.json();
        forcastUrl = data.properties.forecast;
        forcastHourlyUrl = data.properties.forecastHourly;

        weatherForcastInterval = setInterval(async () => {
            log.info(`loc=${location} func=weatherForcastInterval act=starting up forcast`);
            await service.getUpdatedForcast();
        }, config.forcastInterval);

        hourlyForcastInterval = setInterval(async () => {
            log.info(`loc=${location} func=weatherForcastInterval act=starting up forcast`);
            await service.getUpdatedHourlyForcast();
        }, config.hourlyForcastInterval);

    },

    getUpdatedForcast: async () => {
        const response = await fetch(forcastUrl);
        let result = await response.json();
        weatherData.daily = result.properties.periods;
    },

    getUpdatedHourlyForcast: async () => {
        const response = await fetch(forcastHourlyUrl);
        let result = await response.json();
        weatherData.hourly = result.properties.periods;
    },

    getLatestForcast: async () => {
        return weatherData;
    }

}

module.exports = service