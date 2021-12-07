
var user 		= require('../controllers/users.server.controller');

module.exports = function(app) {
	app.post('/certLogin', user.certLogin);
	app.get('/logout', user.logoutFunc);
    app.post('/inputRegister',user.inputRegister); 
};