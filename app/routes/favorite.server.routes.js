var authorize = function(req, res, next) {
  if (req.session.account)
    return next();
  else{
  	return res.redirect('/');
  } 
}
var fav 		= require('../controllers/favourite.server.controller');
module.exports = function(app) {
    app.get('/top10',authorize,fav.top10Render);
    app.get('/lastcreated',authorize,fav.lastcreatedRender);
    app.get('/following',authorize,fav.followingRender);
    app.get('/followed',authorize,fav.followedRender);
    app.get('/showDetailAccount/:id', authorize, fav.showDetailAccount);
}; 
