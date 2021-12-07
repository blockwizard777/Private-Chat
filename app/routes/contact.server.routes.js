var authorize = function(req, res, next) {
  if (req.session.user)
    return next();
  else{
  	return res.redirect('/');
  } 
}
var contact	= require('../controllers/contact.server.controller');
module.exports = function(app) {
  	app.get('/contact', authorize, contact.render);
	app.post('/contact/sendMsg', authorize, contact.sendMsg);
};