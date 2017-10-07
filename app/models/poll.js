'use strict';

var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: "String"
    },
    question: String,
    choices: [
       {
           answer: String,
           count: Number 
       }
    ]
});

module.exports = mongoose.model('Poll', pollSchema);