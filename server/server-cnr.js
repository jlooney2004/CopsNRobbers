var http = require("http").Server();
var io = require("socket.io")(http);

var Player = require("./modules/player");
// var Vec2 = require("./modules/vec2");

var sID = -1;		// Short id counter
var users = {};		// All user data

io.on("connection", function(socket){
	// New player
	sID ++;
	var userID = sID;
	var userType = countTypes();
	users[userID] = new Player(userID, userType);
	console.log("Connected to " + users[userID].id + " : " + users[userID].t);
	socket.broadcast.emit("pNw", users[userID]);
	socket.emit("pCn", users[userID], users);

	// Disconnected player
	socket.on("disconnect", function(){
		console.log("Disconnected " + userID);
		socket.broadcast.emit("pDs", userID);
		delete users[userID];
	});

	// Player Moved
	socket.on("pMv", function(posObject){
		users[userID].x = posObject.x;
		users[userID].y = posObject.y;
		users[userID].z = posObject.z;
		users[userID].a = posObject.a;
		users[userID].b = posObject.b;
		users[userID].c = posObject.c;
	});

	// Player beam
	socket.on("pBm", function(){
		// userID
	})
});

function statusBroadcast(){
	io.emit("pUp", users);
}

setInterval(statusBroadcast, 20);

http.listen(8080, function(){
	console.log("listening on *:8080");
});

// Counts how many ufos and bots exist
function countTypes(){
	var iUfo = 0;
	var iBot = 0;
	for(user in users){
		if(users[user].t === 0){
			iUfo ++;
		}else if(users[user].t === 1){
			iBot ++;
		}
	}

	if(iUfo >= iBot){
		return 1;
	}else{
		return 0;
	}
}