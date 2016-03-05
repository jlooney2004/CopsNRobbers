var http = require("http").Server();
var io = require("socket.io")(http);

var Player = require("./modules/player");
// var Vec2 = require("./modules/vec2");

var sID = -1;		// Short id counter
var users = {};		// All user data
var gadget = {id: -1, x: -26, y: 1.5, z:0};

io.on("connection", function(socket){
	// New player
	sID ++;
	var userID = sID;
	var userType = countTypes();
	users[userID] = new Player(userID, userType);
	console.log("Connected to " + users[userID].id);
	socket.broadcast.emit("pNw", users[userID]);
	socket.emit("pCn", users[userID], users, gadget);

	// Disconnected player
	socket.on("disconnect", function(){
		console.log("Disconnected " + userID);
		// If holding, drop gadget
		if(userID === gadget.id){
			gadget.id = -1;		
			for(user in users){
				users[user].h = -1;
			}
		}
		delete users[userID];
	});

	// Player Moved
	socket.on("pMv", function(posData){
		parseMovedData(userID, posData);
	});

	// Player beam
	socket.on("pBm", function(){
		// userID
	});
});

function statusBroadcast(){
	io.emit("pUp", users);
}

setInterval(statusBroadcast, 20);

http.listen(8080, function(){
	console.log("listening on *:8080");
});

function parseMovedData(userID, posData){
	users[userID].x = posData.x;
	users[userID].y = posData.y;
	users[userID].z = posData.z;
	users[userID].a = posData.a;

	// If user claims to be holder
	if(gadget.id === -1 && posData.h === userID){
		// Corroborate with proximity algorithm
		gadget.id = posData.h;
		console.log("Gadget held by: " + userID);
		for(user in users){
			users[user].h = posData.h;
		}
	}

	// If holder has dropped
	if(gadget.id !== -1 && gadget.id === userID && posData.h === -1){
		console.log("Gadget dropped by: " + userID);
		gadget.id = posData.h;
		for(user in users){
			users[user].h = posData.h;
		}
	}

	// Update gadget pos if holder
	if(userID === posData.h && userID === gadget.id){
		gadget.x = posData.x;
		gadget.y = posData.y;
		gadget.z = posData.z;
	}
}

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