var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000
var compression = require('compression')
var csv = require("fast-csv");
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
                if (err) {
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

var skillNames = ["Total Level", "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Theiving", "Slayer", "Farming", "Runecraft", "Hunter", "Construction", "Summoning", "Dungeoneering", "Divination"]

app.post('/scrape', function(req, res) {
    var username = req.body.username.trim()
    var url = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=' + username
    request(url, function(error, response, body) {
        console.log(response.statusCode);
        var stats = {}
        var counter = 0
        if (!error && response.statusCode == 200) {
            csv.fromString(body, {
                    headers: false
                })
                .on("data", function(data) {
                    stats[skillNames[counter]] = parseInt(data[1])
                    counter++
                })
                .on("end", function() {
                    var quests = []
                    Quest.find({
                        _id: {
                            $nin: req.body.completedQuests
                        }
                    }, function(err, questData) {
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
                                var breakOut = false
                                for (var j in quest.requirements) {
                                    var skill = quest.requirements[j].skill
                                    var level = quest.requirements[j].level
                                    if (stats[skill] < level) {
                                        breakOut = true
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
                })
        }
    })
});


app.listen(port)

console.log('Magic happens on port ' + port);

exports = module.exports = app;
