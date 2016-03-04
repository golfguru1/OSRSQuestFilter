userSchema = new db.Schema({
	username       : String,
	quests			:[{type: db.Schema.Types.ObjectId, ref: 'Quest'}]
})
