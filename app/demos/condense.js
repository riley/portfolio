'use strict';

var fs = require('fs');

var cities = ['denver', 'nyc', 'portland', 'la', 'chicago', 'kc', 'sydney', 'dublin', 'istanbul'];

var matcher = new RegExp('(' + cities.join('|') + ')_2014');
var matchingFilter = function (name) { return name.match(matcher); };

var files = cities.reduce(function (memo, city) {
    memo[city] = fs.readdirSync('/Users/Riley/Documents/repos/weather/data/' + city).filter(matchingFilter);
    return memo;
}, {});

var data = Object.keys(files).reduce(function (m, key) {
    m[key] = files[key].map(function (file) {
        return JSON.parse(fs.readFileSync('/Users/Riley/Documents/repos/weather/data/' + key + '/' + file).toString());
    });
    return m;
}, {});

var finalData = {};

Object.keys(data).forEach(function (city) {
    console.log('parsing ' + city);
    var dailies = data[city].map(function (json) { // json is all the observations for one city for one day

        var low = parseInt(json.history.dailysummary[0].mintempi, 10);
        var high = parseInt(json.history.dailysummary[0].maxtempi, 10);
        var avg = json.history.observations.reduce(function (m, o) {
            return m + parseFloat(o.tempi, 10);
        }, 0) / json.history.observations.length;
        var date = new Date(2014, json.history.dailysummary[0].date.mon - 1, json.history.dailysummary[0].date.mday);

        var niceWeatherPercent = json.history.observations.filter(function (o) {
            return o.conds === 'Clear' || o.conds === 'Scattered Clouds' || o.conds === 'Mostly Sunny' || o.conds === 'Sunny' || o.conds === 'Partly Cloudy';
        }).length / json.history.observations.length;

        return {
            low: low,
            high: high,
            conds: niceWeatherPercent,
            avg: parseFloat(avg.toFixed(2), 10),
            date: date,
            precip: parseFloat(json.history.dailysummary[0].precipi, 10)
        };
    });

    finalData[city] = dailies;

    console.log('created ' + city);
});

try {
    fs.unlinkSync('./data/dailies.json');
} catch (e) {
    console.log('failed to delete dailies.json', e);
}

fs.writeFileSync('./data/dailies.json', JSON.stringify(finalData));


console.log('done');
process.exit();