'use strict';

var fs = require('fs');

var matcher = new RegExp('(boulder|nyc|portland|la)_2014');
var files = {
    portland: fs.readdirSync('/repos/portland/data/portland').filter(function (name) { return name.match(matcher); }),
    boulder: fs.readdirSync('/repos/portland/data/boulder').filter(function (name) { return name.match(matcher); }),
    nyc: fs.readdirSync('/repos/portland/data/nyc').filter(function (name) { return name.match(matcher); }),
    la: fs.readdirSync('/repos/portland/data/la').filter(function (name) { return name.match(matcher); })
};

var data = Object.keys(files).reduce(function (m, key) {
    m[key] = files[key].map(function (file) {
        return JSON.parse(fs.readFileSync('/repos/portland/data/' + key + '/' + file).toString());
    });
    return m;
}, {});

Object.keys(data).forEach(function (city) {
    console.log('parsing ' + city);
    var dailies = data[city].map(function (json) { // json is all the observations for one city for one day

        var low = parseInt(json.history.dailysummary[0].mintempi, 10);
        var high = parseInt(json.history.dailysummary[0].maxtempi, 10);
        var avg = json.history.observations.reduce(function (m, o) {
            return m + parseFloat(o.tempi, 10);
        }, 0) / json.history.observations.length;
        var date = new Date(2014, json.history.dailysummary[0].date.mon - 1, json.history.dailysummary[0].date.mday);

        return {
            low: low,
            high: high,
            avg: parseFloat(avg.toString(2), 10),
            date: date,
            precip: parseFloat(json.history.dailysummary[0].precipi, 10)
        };
    });


    fs.writeFileSync('./data/' + city + '.json', JSON.stringify(dailies));
    console.log('created ' + city);
});

console.log('done');
process.exit();