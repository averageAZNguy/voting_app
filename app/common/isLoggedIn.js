'use strict';

//middleware - check if user is loggedin
module.exports = {
    isLoggedIn: function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You need to login");
        req.flash("success","Welcome to Ask questions");
    	return res.redirect('/login');
    },
    	// convert to array function
	toArray: function toArray(choices){
				var arr = [];
				for (var option in choices){
					console.log(option, choices[option]);
					arr.push({'answer': choices[option], "count": 0});
				} 
				return arr
			}

}