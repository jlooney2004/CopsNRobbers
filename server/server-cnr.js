var http = require("http").Server();
var io = require("socket.io")(http);

var Player = require("./modules/player");
// var Vec2 = require("./modules/vec2");

var sID			= -1;	// Short id counter
var users		= {};	// All user data
var gadget = {id: -1, x: -26, y: 1.5, z:0};

io.on("connection", function(socket){
	// New player
	sID ++;
	var userID = sID;
	users[userID] = new Player(userID, countTypes());
	console.log("Connected to " + users[userID].id);
	socket.broadcast.emit("pNw", users[userID]);
	socket.emit("pCn", users[userID], users, gadget);

	// Disconnected player
	socket.on("disconnect", function(){
		console.log("Disconnected " + userID);
		// If holding, drop gadget
		if(userID === gadget.id){
			updateGadgetHolder(-1);
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

// Broadcasts game status 
function statusBroadcast(){
	io.emit("pUp", users);
}

function parseMovedData(userID, posData){
	if(posData.v !== -1){
		console.log("Attempting with " + posData.v);
	}
	// If UFO
	if(users[userID].t === 0 && users[userID].v === -1){
		// Fired on target
		if(posData.v > 0){
			// Corroborate with proximity algorithm
			users[userID].v = posData.v;
			setTimeout(cooldown, 2000, userID);

			users[posData.v].v = posData.v;
			setTimeout(cooldown, 1000, posData.v);
			console.log(userID + " is abducting: " + users[posData.v].id);
			// If victim is carrying
			if(gadget.id === posData.v){
				updateGadgetHolder(-1);
			}
		}else if(posData.v === -2){
			console.log("Missed");
			users[userID].v = -2;
			setTimeout(cooldown, 2000, userID);
		}
	}else{// If Bot

	}

	// Move positions
	users[userID].x = posData.x;
	users[userID].y = posData.y;
	users[userID].z = posData.z;
	users[userID].a = posData.a;


	// If user claims to be holder
	if(gadget.id === -1 && posData.h === userID){
		// Corroborate with proximity algorithm
		console.log("Gadget held by: " + userID);
		updateGadgetHolder(posData.h);
	}

	// If holder has dropped
	if(gadget.id !== -1 && gadget.id === userID && posData.h === -1){
		console.log("Gadget dropped by: " + userID);
		updateGadgetHolder(posData.h);
	}

	// Update gadget pos if holder
	if(userID === posData.h && userID === gadget.id){
		gadget.x = posData.x;
		gadget.y = posData.y;
		gadget.z = posData.z;
	}
}

function cooldown(userID){
	if(typeof users[userID].v === "undefined") return false;
	console.log("Cooling down " + userID + " from victim " + users[userID].v);
	users[userID].v = -1;
}

// Drops gadget
function updateGadgetHolder(holderID){
	gadget.id = holderID;

	for(user in users){
		users[user].h = holderID;
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

setInterval(statusBroadcast, 20);

http.listen(8080, function(){
	console.log("listening on *:8080");
});