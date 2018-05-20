var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server)
	users={};
	

	server.listen(3000);
	
	app.get('/',function(req,res){
		res.sendFile(__dirname+'/index.html')
	});
	
	io.sockets.on('connection',function(socket){
		socket.on('send message',function(data, callback){
			var msg = data.trim();
			if(msg.substr(0,3)==='/w '){
				console.log('whisper');
				msg = msg.substr(3);
				var index = msg.indexOf(' ');
				if(index!==-1){
					var name = msg.substr(0,index);
					var msg1 = msg.substr(index+1);
					if(name in users){
						users[name].emit('whisper',{msg:msg1, nick:socket.nickname});
					}else{
						callback('Error! Please enter a valid user');
					}
				}else{
					callback('Error! Enter a message for your whisper!');
				}
			}else{
				io.sockets.emit('new message',{msg:data, nick:socket.nickname});
			}
		});
		
		socket.on('new user',function(data,callback){
			if(data in users){
				callback(false);
			}else{
				callback(true);
				socket.nickname = data;
				users[socket.nickname] = socket;
				io.sockets.emit('usernames',Object.keys(users));
			}
		});
		
		socket.on('disconnect',function(data){
		if(!socket.nickname) {return;}
		else{
			delete users[socket.nickname];
			io.sockets.emit('usernames',Object.keys(users));
		}
	})
	});