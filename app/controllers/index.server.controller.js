var User   = require('mongoose').model('User');

exports.showlogInView = function(req, res) {
  	res.render('login');  
};

exports.showRegisterView = function(req,res){
  	res.render('register'); 
};
exports.admin = function(req,res){
   res.render('admin/login');
}


/*end admin panel part*/