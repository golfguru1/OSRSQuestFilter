questSchema = new db.Schema({
        name: String,
        requirements: [{
            skill: String,
            level: Number
        }]
})
