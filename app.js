
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

/**
 * Routes
 */  
app.get("/", function (req, res) {

    if (req.session.user) {
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
    } else {
        res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");
    }
});

app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
});

app.post("/signup", userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/');
                    });
                }
            });
        });
    });
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {

            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/profile', requiredAuthentication, function (req, res) {
    res.send('Profile page of '+ req.session.user.username +'<br>'+' click to <a href="/logout">logout</a>');
});


/**
 * Create app and listen on port 3000
 */
 http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});