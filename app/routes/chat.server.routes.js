var authorize = function(req, res, next) {
  if (req.session.user)
    return next();
  else{
  	return res.redirect('/');
  } 
}

var index 		= require('../controllers/chat.server.controller');
/*var category 	= require('../controllers/category.server.controller');
var media		= require('../controllers/media.server.controller');
var faqManage	= require('../controllers/faqManage.server.controller');
var contactManage	= require('../controllers/contactManage.server.controller');
*/
module.exports = function(app) {
	app.get('/home', authorize, index.home);
	app.get('/getUserList', authorize, index.getUserList);
};