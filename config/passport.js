 
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var graph = require('fbgraph');

var User            = require('../app/models/user');
var configAuth = require('./auth');

module.exports = function(passport) {


	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
		profileFields: ['displayName','emails'],
	
	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		User.findOne({'facebook.id': profile.id}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User();
	    				newUser.facebook.id = profile.id;
	    				newUser.facebook.token = accessToken;
	    				newUser.facebook.name = profile.displayName;
	    				newUser.facebook.email = profile.emails[0].value;
						newUser.facebook.picture = 'http://graph.facebook.com/' + profile.id + '/picture?type=large';
						newUser.facebook.friendlist='https://graph.facebook.com/v1.0/' + profile.id +'/friendlists?access_token='+accessToken;
						//https://graph.facebook.com/fbID/friends?access_token=appid|appsecret
						//me?fields=friendlists

						// accessToken is returned by Express
						// graph.setAccessToken(accessToken);

						// var getFriends = function(url) {
						// 	graph.get(url, function (err, res) {
						// 		console.log(res);
						// 		if (res.paging && res.paging.next) {
						// 			getFriends(res.paging.next);
						// 		}
						// 	});
						// };

						// getFriends('/me/friends');



	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				})
	    				console.log(profile);
						 
	    			}
	    		});
	    	});
	    }

	));

	passport.use(new GoogleStrategy({
	    clientID: configAuth.googleAuth.clientID,
	    clientSecret: configAuth.googleAuth.clientSecret,
	    callbackURL: configAuth.googleAuth.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		User.findOne({'google.id': profile.id}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User();
	    				newUser.google.id = profile.id;
	    				newUser.google.token = accessToken;
	    				newUser.google.name = profile.displayName;
	    				newUser.google.email = profile.emails[0].value;

	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				})
	    				console.log(profile);
	    			}
	    		});
	    	});
	    }

	));


	


};