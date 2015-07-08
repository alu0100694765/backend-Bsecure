/*
*Module Dependencies 
*/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    config = require('./config'),
    hash = require('./pass').hash;

var app = express();

function createToken(user) {
    var user_type = 0;
    if (user.admin == "true") {
        user_type = 1;
    };  
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(7, "days").unix(),
        role: user_type,
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}


/*
Database and Models
*/
mongoose.connect(url);
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    title: String,
    name: String,
    surname: String,
    age: Number,
    sex: String,
    idType: String,
    idNumber: String,
    address: String,
    locality: String,
    city: String,
    zipCode: Number,
    country: String,
    email: String,
    phone: Number,
    secondPhone: Number,
    heartPatient: String,
    respiratoryPatient: String,
    Hemophilia: String,
    bloodGroup: String,
    allergies: String,
    otherComments: String,
    img: String,
    admin: String,
    salt: String,
    hash: String
});

var User = mongoose.model('users', UserSchema);
/*
Middlewares and configurations 
*/
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser('Authentication Tutorial '));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, '/public')));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
});

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
/*
Helper Functions
*/
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    User.findOne({
        username: name
    },

    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
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
        username: req.body.id_username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.render("signup", {
                error: 'true',
            });
        }
    });
}

/*
Routes
*/
app.get("/", function (req, res) {

    if (req.session.user) {
      User.find({'_id': req.session.user._id}, function (err, item) {
        res.render('dashboard', {
            result: item,

        });
    });
    } else {
        res.render("login");
    }
});

app.get("/editprofile", function (req, res) {
    if (req.session.user) {
         User.find({'_id': req.session.user._id}, function (err, item) {
        res.render('editprofile', {
            result: item,

        });
        });
    } else {
        res.redirect("/");
    }
});

app.post("/editprofile", function (req, res) {
    var username = req.body.id_username;
    var title = req.body.id_title;
    var first_name = req.body.id_first_name;
    var last_name = req.body.id_last_name;
    var age = req.body.id_age;
    var sex = req.body.id_sex;
    var id_type = req.body.id_identification;
    var id_number = req.body.id_number;
    var address = req.body.id_address;
    var locality = req.body.id_locality;
    var city = req.body.id_city;
    var zip_code = req.body.id_zip_code;
    var country = req.body.id_country;
    var email = req.body.id_email;
    var phone = req.body.id_phone;
    var alternative_phone = req.body.id_alternative_phone;
    var heart = req.body.id_heart;
    var respiratory = req.body.id_respiratory;
    var blood = req.body.id_blood;
    var hemophilia = req.body.id_hemophilia;
    var allergies = req.body.id_allergies;
    var comments = req.body.id_comments;
    
   if (req.files.image.length > 0) {
    var tmp_path = req.files.image.path;
   
    var tmp_buffer = new Buffer(fs.readFileSync(tmp_path));
    var base64_image = tmp_buffer.toString('base64');

    User.findByIdAndUpdate(req.session.user._id, {
            username: username,
            title: title,
            name: first_name,
            surname: last_name,
            age: age,
            sex: sex,
            idType: id_type,
            idNumber: id_number,
            address: address,
            locality: locality,
            city: city,
            zipCode: zip_code,
            country: country,
            email: email,
            phone: phone,
            secondPhone: alternative_phone,
            heartPatient: heart,
            respiratoryPatient: respiratory,
            Hemophilia: hemophilia,
            bloodGroup: blood,
            allergies: allergies,
            otherComments: comments,
            img: base64_image
    }, function(err, user) {
         if (err) throw err;
        res.send(200);
        res.redirect("/");
    });
   } else {
    User.findByIdAndUpdate(req.session.user._id, {
            username: username,
            title: title,
            name: first_name,
            surname: last_name,
            age: age,
            sex: sex,
            idType: id_type,
            idNumber: id_number,
            address: address,
            locality: locality,
            city: city,
            zipCode: zip_code,
            country: country,
            email: email,
            phone: phone,
            secondPhone: alternative_phone,
            heartPatient: heart,
            respiratoryPatient: respiratory,
            Hemophilia: hemophilia,
            bloodGroup: blood,
            allergies: allergies,
            otherComments: comments,
    }, function(err, user) {
         if (err) throw err;
       res.send(200);
       res.redirect("/");
    });
   }; 
});

app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
});

app.post("/signup", userExist, function (req, res) {
    var password = req.body.id_password;
    var username = req.body.id_username;
    var title = req.body.id_title;
    var first_name = req.body.id_first_name;
    var last_name = req.body.id_last_name;
    var age = req.body.id_age;
    var sex = req.body.id_gender;
    var id_type = req.body.id_identification;
    var id_number = req.body.id_number;
    var address = req.body.id_address;
    var locality = req.body.id_locality;
    var city = req.body.id_city;
    var zip_code = req.body.id_zip_code;
    var country = req.body.id_country;
    var email = req.body.id_email;
    var phone = req.body.id_phone;
    var alternative_phone = req.body.id_alternative_phone;
    var heart = req.body.id_heart;
    var respiratory = req.body.id_respiratory;
    var blood = req.body.id_blood;
    var hemophilia = req.body.id_hemophilia;
    var allergies = req.body.id_allergies;
    var comments = req.body.id_comments;
    
    var tmp_path = req.files.image.path;
   
    var tmp_buffer = new Buffer(fs.readFileSync(tmp_path));
    var base64_image = tmp_buffer.toString('base64');

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            title: title,
            name: first_name,
            surname: last_name,
            age: age,
            sex: sex,
            idType: id_type,
            idNumber: id_number,
            address: address,
            locality: locality,
            city: city,
            zipCode: zip_code,
            country: country,
            email: email,
            phone: phone,
            secondPhone: alternative_phone,
            heartPatient: heart,
            respiratoryPatient: respiratory,
            Hemophilia: hemophilia,
            bloodGroup: blood,
            allergies: allergies,
            otherComments: comments,
            salt: salt,
            img: base64_image,
            admin: "false",
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
            res.render('login', {
                error: 'true'
            });
        }
    });
});

app.post("/login-android", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            req.session.regenerate(function () {
                var tok = createToken(user);
                var payload = jwt.decode(tok, config.TOKEN_SECRET);
                var date = moment.unix(payload.exp).format("MM/DD/YYYY");
                
                var name = user.title + " " + user.name + " " + user.surname;

                return res.status(200).send({token: tok, exp: date, name: name});
            });
        } else {
            return res.status(401);
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



app.get('/users/:id', function (req, res) {
    var user_type = "public";
    if (req.session.user) {
        if (req.session.user.admin == "true" || req.session.user._id == req.params.id) {
            user_type = "private";
        };
    };
    User.find({'_id': req.params.id}, function (err, item) {
        res.render('profile', {
            result: item,
            profile_type: user_type,
        });
    });
});


app.get('/users/:id/:authorization', function (req, res, next) {
        var token = req.params.authorization;
        var payload = jwt.decode(token,config.TOKEN_SECRET);

        if (payload.exp <= moment().unix()) {
            res.status(401).send({message: "El token ha expirado"});
        } else {           
            var user_type = "public";
            if (payload.role == 1 || payload.sub == req.params.id) {
                user_type = "private";
            };
            User.find({'_id': req.params.id}, function (err, item) {
                res.render('profile', {
                    result: item,
                    profile_type: user_type,
                });
            });   
        };
});


app.get('/calendar', function (req, res) {
    if (req.session.user) {
         User.find({'_id': req.session.user._id}, function (err, item) {
        res.render('calendar', {
            result: item,
        });
        });
    } else {
        res.redirect("/");
    }
});

app.get('/beacon', function (req, res) {
    if (req.session.user) {
        User.find({'_id': req.session.user._id}, function (err, item) {
        res.render('beacon', {
            result: item,

        });
        });
    } else {
        res.redirect("/");
    }
});

app.get('/help', function (req, res) {
    if (req.session.user) {
         User.find({'_id': req.session.user._id}, function (err, item) {
        res.render('help', {
            result: item,

        });
        });
    } else {
        res.redirect("/");
    }
});

app.get('/data', function (req, res) {
    if (req.session.user && req.session.user.admin == "true") {
        var actual_user;
        User.find({'_id': req.session.user._id}, function (err, u) {
            actual_user = u;
           if (u != null && u != undefined) {
                 User.find({}, {name: 1, age: 1, sex: 1, idType: 1, idNumber: 1, phone: 1, surname: 1, _id: 0}, function (err, item) {
                    User.find({}, {name: 1, address: 1, locality: 1, city: 1, country: 1, surname: 1, _id: 0}, function (err, a) {
                        User.find({}, {name: 1, heartPatient: 1, respiratoryPatient: 1, Hemophilia: 1, allergies: 1, surname: 1, _id: 0}, function (err, h) {
                            res.render('data', {
                                result: actual_user,
                                tableData: item,
                                addr: a,
                                health: h,
                            });
                        });
                    });
                 });
           };
        });

        
    } else {
        res.redirect("/");
    }
});

app.get('/stats', function (req, res) {
    if (req.session.user && req.session.user.admin == "true") {
         User.find({'_id': req.session.user._id}, function (err, item) {
            User.find({'sex': 'Male'}, function (err, men) {
                User.find({'sex': 'Female'}, function (err, women) {
                    User.find({'heartPatient': 'Yes'}, function (err, heart) {
                        User.find({'respiratoryPatient': 'Yes'}, function (err, respiratory) {
                            User.find({'Hemophilia': 'Yes'}, function (err, hemophilia) {
                                res.render('stats', {
                                    result: item,
                                    n_men: men,
                                    n_women: women,
                                    n_heart: heart,
                                    n_respiratory: respiratory,
                                    n_hemophilia: hemophilia
                                 });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
});


http.createServer(app).listen(3000);