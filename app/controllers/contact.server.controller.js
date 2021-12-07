var Contact  = require('mongoose').model('Contact');

exports.render = function(req, res) {
	var username = req.session.user.userName;
	Contact.find({}).exec(function(err, datas){
		res.render('contact', {
	        pagename: 'contact',
			datas: datas,
			user : req.session.user, 
			username:username});  
	});
};
exports.sendMsg = function(req, res, next) {
    var contact = new Contact(req.body);
    console.log(contact);
    contact.save(function(err) {
    	if (!err) {
		  	return res.json("ok");
		} else {
		  	return res.json("err");
		}
  	});
};