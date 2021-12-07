var authorize = function(req, res, next) {
  if (req.session.user)
    return next();
  else{
  	return res.redirect('/');
  } 
}
var faq	= require('../controllers/faq.server.controller');
module.exports = function(app) {
    app.get('/faq',authorize,faq.index);
};