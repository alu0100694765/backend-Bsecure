
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , hash = require('./pass').hash;

var app = express();

/** 
 * Database and Models 
 */
mongoose.connect("mongodb://localhost/users");
var userSchema = new mongoose.Schema({
	username: String,
    password: String,
    salt: String,
    hash: String
});

var User = mongoose.model('users', userSchema);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Success and Error messages
 */
app.use(function(request, result, next) {
	
	var error = request.session.error;
	var message =  request.session.success;
	
	delete request.session.error;
	delete request.session.success;
	
	result.locals.message = '';
	
	if (error)
		result.locals.message = '<p class="msg error">' + error + '</p>';
	if (success) 
		result.locals.message = '<p class="msg success">' + message + '</p>';

	next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/**
 * Helper functions
 */
function authenticate(name, password, fn) {
	if (!module.parent) 
		console.log('authenticating %s:%s', name, password);

	User.findOne({
		username: name
	},  function (err, user) {
        	if (user) {
            	if (err) 
            		return fn(new Error('cannot find user'));
            		
            		hash(pass, user.salt, function (err, hash) {
                		if (err) 
                			return fn(err);
                		if (hash == user.hash) 
                			return fn(null, user);
                		fn(new Error('invalid password'));
            		});
        	} else {
            	return fn(new Error('cannot find user'));
        	}
    });
}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExist(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/signup");
        }
    });
}

