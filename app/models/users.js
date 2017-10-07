'use strict';

var mongoose                = require('mongoose'),
    passportlocalmongoose   = require('passport-local-mongoose');
    
var Schema                  = mongoose.Schema;

var User = new Schema({
    username: String,
    password: String,
    email: String,
	github: {
		id: String,
		displayName: String,
		username: String,
      publicRepos: Number
	}

});

User.plugin(passportlocalmongoose); //gives all passport methods to user models
// The plugin provides already made methods to use without having to write them
module.exports = mongoose.model('User', User);
