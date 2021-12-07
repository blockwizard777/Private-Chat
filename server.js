process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose'),
express = require('./config/express');

var mongoose = mongoose();
var app = express();



var http = require('http').Server(app);
var sockServer = require('./app/controllers/socket.server')(http);

app.post('/uploadAttachFile', sockServer.uploadAttachFile);
app.get('/downloadUploadedFile/:roomId/:id', sockServer.downloadUploadedFile);
app.post('/createRoom', sockServer.createRoom);

http.listen(3000);

module.exports = app;

console.log('Server running at http://localhost:3000/');