var config = require('./config'),
  express = require('express'),
  morgan = require('morgan'),
  http = require('http'),
  path = require('path'),
  stylus = require('stylus'),
  nib = require('nib'),
  compress = require('compression'),
  bodyParser = require('body-parser'),
//  multer = require('multer'),
  methodOverride = require('method-override'),
  fs = require('fs'),
  session = require('express-session');

var busboi = require('connect-busboy');
var cors = require('cors'); // "Request" library

exports.DESTINATION = __dirname+'/public/uploads';
module.exports = function () {
	var app = express();

	app.use(cors({
			allowedOrigins: [
					'localhost',
					'app://',
					'app'
			]
	}));

app.use(busboi());


	app.locals.appTitle = 'MediaSearch-Sites';
	app.locals.error = '';
	if (process.env.NODE_ENV === 'development') {
	  app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
      app.use(compress());
	}
	app.use(express.cookieParser(config.cookieSecret));
	app.use(session({
	  saveUninitialized: true,
	  resave: true,
	  secret: config.sessionSecret
	}));
	app.use(bodyParser.urlencoded({
	  extended: false
	}));
//	app.use(multer({dest:'./tmp/'}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(app.router);	

	app.set('port', process.env.PORT || 3000);
	app.set('views', './app/views');
	app.set('view engine', 'ejs');

	require('../app/routes/index.server.routes.js')(app);
	require('../app/routes/users.server.routes.js')(app);
	require('../app/routes/chat.server.routes.js')(app);
	//require('../app/routes/room.server.routes.js')(app);
	/*
	require('../app/routes/mypage.server.routes.js')(app);*/
	require('../app/routes/admin.server.routes.js')(app);
	require('../app/routes/faq.server.routes.js')(app);
//	require('../app/routes/favorite.server.routes.js')(app);
	require('../app/routes/contact.server.routes.js')(app);
	app.use(express.static('./public'));

	return app;
};