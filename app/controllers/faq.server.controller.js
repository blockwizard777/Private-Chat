var Faqs  = require('mongoose').model('Faqs');

exports.index = function(req, res) {
	var username = req.session.user.userName;
	Faqs.find({}).exec(function(err, datas){
		if(!err) res.render('faqView', {
	        pagename: 'faq',
			datas: datas,
			user : req.session.user, 
			username:username});  
	});
};