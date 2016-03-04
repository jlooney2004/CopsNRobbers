var http = require("http").Server();
var io = require("socket.io")(http);

var Player = require("./modules/player");
// var Vec2 = require("./modules/vec2");

var sID = -1;		// Short id counter
var users = {};		// All user data
var gadget = {i: -1, x: -26, y: 1.5, z:0};

io.on("connection", function(socket){
	// New player
	sID ++;
	var userID = sID;
	var userType = countTypes();
	users[userID] = new Player(userID, userType);
	console.log("Connected to " + users[userID].id + " : " + users[userID].t);
	socket.broadcast.emit("pNw", users[userID]);
	socket.emit("pCn", users[userID], users, gadget);

	// Disconnected player
	socket.on("disconnect", function(){
		console.log("Disconnected " + userID);
		if(userID === gadget.i){
			socket.broadcast.emit("pDs", {
				i: gadget.i,
				x: users[userID].x,
				y: users[userID].y,
				z: users[userID].z
			});
			gadget.i = -1;
		}else{
			socket.broadcast.emit("pDs", userID);
		}
		delete users[userID];
	});

	// Player Moved
	socket.on("pMv", function(posObject){
		users[userID].x = posObject.x;
		users[userID].y = posObject.y;
		users[userID].z = posObject.z;
		users[userID].a = posObject.a;
	});

	// Player beam
	socket.on("pBm", function(){
		// userID
	});

	// Gadget I Picked
	socket.on("gIp", function(gadgetInfo){
		// Check proximity before proceeding
		gadget = gadgetInfo;
		socket.broadcast.emit("gOp", gadget.i);
	});

	// Gadget I dropped
	socket.on("gId", function(gadgetInfo){
		gadget = gadgetInfo;
		socket.broadcast.emit("gOd", gadgetInfo);
		gadget.i = -1;
	});
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