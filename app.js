var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var async = require('async')
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

//ROUTES ===============================================

app.post('/scrape', function(req, res) {
    console.log(req.body.username)
    url = 'http://services.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws';
    request({
        method: 'POST',
        uri: 'http://services.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws',
        har: {
            url: 'http://services.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws',
            method: 'POST',
            headers: [{
                name: 'content-type',
                value: 'application/x-www-form-urlencoded'
            }],
            postData: {
                mimeType: 'application/x-www-form-urlencoded',
                params: [{
                    name: 'user1',
                    value: req.body.username
                }]
            }
        }
    }, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var list = []
            $('td[align="left"]').filter(function() {
                var data = $(this);
                var el = data.text().split('\n')
                var trigger = false
                if (el.length != 3) {

                    for (var i = 0; i < el.length; i++) {
                        var item = {
                            name: '',
                            rank: '',
                            level: '',
                            xp: ''
                        }
                        if (el[i] == "Attack")
                            trigger = true
                        if (trigger) {
                            while (1) {
                                var item = {
                                    name: el[i],
                                    rank: el[i + 2],
                                    level: el[i + 3],
                                    xp: el[i + 4],
                                }
                                list.push(item)
                                i = i + 9
                                if (i >= el.length - 1)
                                    break;
                            }
                        }
                    }
                }
            })
            res.send(list)
        } else {
            console.log('there was an error')
        }
    })
})

app.listen('1330')

console.log('Magic happens on port 1330');

exports = module.exports = app;
