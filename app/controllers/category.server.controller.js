
var Category = require("mongoose").model("Category");
exports.showInfo = function(req, res) {
    console.log(req.session.fullname);

  if (req.session && req.session.administrator){

    var fullname = req.session.fullname;
    
    Category.find().sort('categoryType').exec(function(err, datas){
      if (err) return next(err);
      if (!datas) return next(new Error('No Categorys to display.'));
      res.render('admin/categoryView',{fullname:fullname, datas : datas});
    });

    
  }
  else{
    res.redirect('/admin');
  }
};

exports.createCategory = function(req,res){
    var newCategory = new Category(req.body);
    newCategory.save(function(error){
      if(error){
         var message = getErrorMessage(error);
         return res.json(message);
      } 
      else 
      {
        res.json("ok");
      }
    });
};

exports.delCategory = function(req,res){
    
};
