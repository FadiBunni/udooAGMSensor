const net = require('net');
const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const path    = require('path');

var udooData;

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use(express.static(path.join(__dirname + '/client')));

const port = process.env.PORT || 2000;
http.listen(port,function(){
	console.log('Server started: http://localhost:2000/');
});

io.on('connection', function(socket){
	console.log('user connected: ', socket.id);
	setInterval(function(){
		if(!undefined){
			io.emit("udooData",udooData);
		}
	},10);
});

var server = net.createServer(function(socket){
	socket.write('hallo from server');

	socket.on('data', function(data) {
		 try {
		   	json = JSON.parse(data);
		   	console.log(json);
		    udooData=json;
		  } catch (e) {
		    // Oh well, but whatever...
		  }
	});
});

server.listen(1337);