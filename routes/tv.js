module.exports = function(app, config) {
    var request = require("request");
    var moment = require('moment');

    app.get('/sonarr_api', function(req, res) {
        var options = {
            url:
                config.sonarr.api_url + //from config file
                '/calendar?start=' +  //start date
                moment().subtract(365,'days').format('YYYY-MM-DD') + //last year (365 days before now)
                '&end=' + //end date
                moment().add(365,'days').format('YYYY-MM-DD'), //next year (365 days from now)
            headers: { 'x-api-key': config.sonarr.api } //api key sent as header
        };
        function callback(error, response, body) {
            var shows = JSON.parse(body);
            var formattedJSON = []; // initialise
            for (var show in shows) { //add the colour to the tv show. not the best way to do this but works i guess
                var status = 'mdl-color--indigo-400'; //default unaired
                if (!shows[show].hasFile && moment().isAfter(shows[show].airDateUtc)) {
                    status = 'mdl-color--red'; //missing
                } else if (shows[show].hasFile) {
                    status = 'mdl-color--green'; //downloaded
                //during the airdate and before the finish time. add the runtime to the start time to get the end time
                } else if (moment().isAfter(moment(shows[show].airDateUtc)) && moment().isBefore(moment(shows[show].airDateUtc).add('minutes', shows[show].runtime))) {
                    status = 'mdl-color--orange-600'; //on air
                }
                // chuck it all in the array
                formattedJSON.push({
                    title       : shows[show].series.title,
                    allDay      : false,
                    season      : shows[show].seasonNumber,
                    episode     : shows[show].episodeNumber,
                    start       : shows[show].airDateUtc,
                    className   : [status, 'mdl-shadow--2dp'], // add the mdl shadow on along with the status of the episode
                    overview    : shows[show].overview,
                    poster      : shows[show].series.images[2].url // 2 because 0 is the first
                });
            }
            res.send(formattedJSON);
        }
        request(options, callback);
    });
};
