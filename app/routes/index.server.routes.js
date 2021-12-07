var authorize = function(req, res, next) {
  if (req.session.user)
    return next();
  else{
  	return res.redirect('/');
  } 
}

var goHome = function(req, res, next) {
  if (req.session.user)
    return res.redirect('/home');
  else{
  	return res.redirect('/login');
  }
}

var index 		= require('../controllers/index.server.controller');
module.exports = function(app) {
	app.get('/', goHome);
  app.get('/login',index.showlogInView);
  app.get('/register',index.showRegisterView);
};