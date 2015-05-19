/*
Module Dependencies 
*/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    hash = require('./pass').hash;

var app = express();

/*
Database and Models
*/
mongoose.connect("mongodb://localhost/myapp");
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
       // res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
      // console.log(req.session.user);
      
      User.find({'_id': req.session.user._id}, function (err, item) {
        //console.log(item);
        //console.log(item);
        res.render('dashboard', {
            result: item,

        });
       // console.log(item);
    });

      /*var userData = req.session.user;
      res.render('dashboard', {
            result: userData,
       });*/
    } else {
        //res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");
        res.render("login");
    }
});

app.get("/editprofile", function (req, res) {
    if (req.session.user) {
         User.find({'_id': req.session.user._id}, function (err, item) {
        //console.log(item);
        //console.log(item);
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
    console.log("entra");
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

        // we have the updated user returned to us
        //console.log(user);
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
       // we have the updated user returned to us
       // console.log(user);       
       res.send(200);
       res.redirect("/");
    });
   }; 
   
    //res.redirect("/");
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

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/profile', requiredAuthentication, function (req, res) {
    res.send('Profile page of '+ req.session.user.username +'<br>'+' click to <a href="/logout">logout</a>');
});



app.get('/users/:id', function (req, res) {
    //console.log(req.params);
    //console.log('findById: ' + req.params.id);
    User.find({'_id': req.params.id}, function (err, item) {
        //console.log(item);
        console.log(item);
        res.render('profile', {
            result: item,

        });
       // console.log(item);
    });
});


app.get('/calendar', function (req, res) {
    if (req.session.user) {
         User.find({'_id': req.session.user._id}, function (err, item) {
        //console.log(item);
        //console.log(item);
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
        //console.log(item);
        //console.log(item);
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
        //console.log(item);
        //console.log(item);
        res.render('help', {
            result: item,

        });
        });
    } else {
        res.redirect("/");
    }
});

app.get('/data', function (req, res) {
    if (req.session.user) {
        var actual_user;
        User.find({'_id': req.session.user._id}, function (err, u) {
            actual_user = u;
           if (u != null && u != undefined) {
                 User.find({}, {name: 1, age: 1, sex: 1, idType: 1, idNumber: 1, phone: 1, surname: 1, _id: 0}, function (err, item) {
                    console.log(item);
                    res.render('data', {
                        result: actual_user,
                        tableData: item,
                    });
                    });
           };
        });

        
    } else {
        res.redirect("/");
    }
});

app.get('/stats', function (req, res) {
    if (req.session.user) {
         User.find({}, function (err, item) {
        //console.log(item);
        //console.log(item);
        res.render('stats', {
            result: item,
         });
        });
    } else {
        res.redirect("/");
    }
});


http.createServer(app).listen(3000);