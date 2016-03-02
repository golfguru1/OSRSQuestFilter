var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var async = require('async')
var bodyParser = require('body-parser');
var questData = require('./data.js')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

//ROUTES ===============================================

app.get('/', function(req, res){
	res.sendfile('./public/index.html')
})

app.post('/scrape', function(req, res) {
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
			list.pop()
            var quests = []
            for (var i in questData) {
                var quest = questData[i]
                if (quest.requirements.length == 0) {
                    quests.push(quest.name)
                    continue
                }
                for (var j in quest.requirements) {
                    var skill = quest.requirements[j].skill
                    var level = quest.requirements[j].level
                    var breakOut = false
                    for (var k in list) {
                        var playerSkill = list[k]
                        if (playerSkill.name == skill) {
                            if (playerSkill.level < level) {
                                breakOut = true
                                break
                            }
                        }
                    }
                    if (breakOut) {
                        break
                    }
                }
				if (!breakOut){
					quests.push(quest.name)
				}
            }
            res.send(quests)
        } else {
            console.log('there was an error')
        }
    })
})

app.listen('1330')

console.log('Magic happens on port 1330');

exports = module.exports = app;
