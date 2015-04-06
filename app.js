
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
