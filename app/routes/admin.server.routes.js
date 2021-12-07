var authorize = function(req, res, next) {
  if (req.session && req.session.administrator)
    return next();
  else{
  	return res.redirect('/admin');
  } 
}
var manager 	= require('../controllers/admin.server.controller');
var faqManager = require('../controllers/faqMg.server.controller');
var contactManager = require('../controllers/contactManager.server.controller');
module.exports = function(app) {
  app.get('/admin',manager.admin);
  app.post('/adminLogin',manager.adminLogin);
  app.get('/adminLogout',manager.adminLogout);

/* Dashboard (Users) */
  app.get('/dashboard',authorize,manager.dashboard)
  app.get('/addUser',authorize,manager.store)
  app.post('/delUsers',authorize,manager.delUsers)

/* FAQ */
  app.get('/faqMg',authorize,faqManager.showfaq);
  app.get('/fagMg/getContent',authorize,faqManager.getContent);
  app.post('/updateFaq',authorize,faqManager.updateFaq);
  app.post('/addFaq',authorize,faqManager.store);
  app.post('/delFaqs',authorize,faqManager.del);

/* ContactUS */
  app.get('/contactMg', authorize, contactManager.render);
	app.post('/delQuestion',authorize, contactManager.del);
};