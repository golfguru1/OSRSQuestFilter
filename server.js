var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000
var compression = require('compression')
db = require('mongoose');


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(__dirname + '/public'))
app.use(compression())

// DATBASE CONFIGS ===================================
db.connect('mongodb://harkmall:titleist1@ds019658.mlab.com:19658/osrsquestfilter', function(err, db) {
    if (err) throw err;
    console.log("Connected to Database");
    _db = db
})
require('./db/userSchema.js')
require('./db/questSchema.js')
User = db.model('User', userSchema)
Quest = db.model('Quest', questSchema)

//ROUTES ===============================================

app.get('/', function(req, res) {
    res.sendFile('./public/index.html')
})

app.post('/saveQuest', function(req, res) {
    var username = req.body.username
    var questID = req.body._id

    Quest.findOne({
        _id: questID
    }, function(err, quest) {
        if (err) {
            res.send(err)
        }
        if (quest) {
			console.log(quest)
            User.findOne({
                username: username
            }, function(err, user) {
                if (err){
                    res.send(err)
				}
                if (user) {
					user.quests.push(quest)
					user.save()
                } else {
					res.sendStatus(500)
				}
            })
        }
    })
})

app.post('/user', function(req, res) {

	var username = req.body.username.trim()

	User.findOne({
		username: username
	}, function(err, user) {
		if (err)
			res.send(err)
		if (user) {
			console.log("user exists")
			res.send(user)
		} else {
			var newUser = new User({
				username: username,
				quests: []
			})
			newUser.save(function(err, user) {
				if (err)
					res.send(err)
				else {
					res.send(user)
				}
			})
		}
	})
})

app.post('/scrape', function(req, res) {

	var username = req.body.username.trim()

    console.log("here")
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
                    value: username
                }]
            }
        }
    }, function(error, response, html) {
        if (html.indexOf("No player") > -1) {
            res.send("nope")
        }
        console.log("in response")
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
            Quest.find({_id:{$nin:req.body.completedQuests}},function(err, questData) {
                if (err) {
                    console.log(err)
                    res.send(quests)
                } else {
                    for (var i in questData) {
                        var quest = questData[i]
                        if (quest.requirements.length == 0) {
                            quests.push(quest)
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
                        if (!breakOut) {
                            quests.push(quest)
                        }
                    }
                    console.log("done")
                    res.send(quests)
                }
            })
        } else {
            console.log('there was an error')
        }
    })
})

app.listen(port)

console.log('Magic happens on port ' + port);

exports = module.exports = app;
