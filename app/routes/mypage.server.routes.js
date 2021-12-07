var authorize = function(req, res, next) {
  if (req.session.account)
    return next();
  else{
  	return res.redirect('/');
  } 
    
}

var mypage = require('../controllers/mypage.server.controller');

module.exports = function(app) {
	app.get('/mypage', authorize,mypage.renderFunc);
  app.get('/mypage/postMedia',authorize,mypage.postMediaFunc);
  app.post('/mypage/postMedia',authorize,mypage.storeMedia);

  app.get('/myupload', authorize,mypage.myupload);
  app.post('/uploads',authorize,mypage.uploadFile);

  app.get('/myuploadMusic', authorize,mypage.myuploadMusic);
  app.post('/uploadMusicFile',authorize,mypage.uploadMusicFile);
  
  app.get('/showDetail/:id', authorize, mypage.showDetail);
  app.post('/update', authorize, mypage.update);
};