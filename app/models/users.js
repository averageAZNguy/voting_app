'use strict';

var mongoose    = require('mongoose'),
    bcrypt      = require('bcrypt-nodejs');
    // passportlocalmongoose   = require('passport-local-mongoose');
var Schema      = mongoose.Schema;

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

//============== methods ================
// generate hash
User.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(), null)
};

User.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// User.plugin(passportlocalmongoose); //gives all passport methods to user models
// The plugin provides already made methods to use without having to write them
module.exports = mongoose.model('User', User);
