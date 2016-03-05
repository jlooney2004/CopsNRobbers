pc.script.create('control', function (app) {
	// Creates a new Control instance
	var Control = function (entity) {
		this.entity		= entity;
		this.camera		= null;
		this.gadget		= null;
		this.receiver	= null;			// Receiver script
		this.receiverE	= null;			// Receiver entity
		this.socket		= null;			// Socket connection
		this.sStatus	= "pre-init";	// Socket status
		this.id			= null;			// Unique id
		this.dummies	= {};			// Entities of other bots/ufos
		this.holderID	= -1;			// ID of holder
		this.prelimID	= -1;			// ID before server approval
		this.tempUsr	= null;			// For iteration

		this.vectorX	= 0;
		this.vectorZ	= 0;
		this.yAngle		= 0;
		this.autoX		= 0;
		this.autoZ		= 0;
		this.autoTimer	= 0;
		this.autoTimerMax = getRandNo(1, 3);
	};

	Control.prototype = {
		// Called once before 1st update
		initialize: function () {
			this.camera = app.root.findByName("Cam");
			this.gadget = app.root.findByName("Gadget");
			this.sStatus = "initializing";
			this.socket = io("http://localhost:8080");
			this.socket.on("connect_error", this.sError.bind(this));
			this.socket.on("disconnect", this.sDisc.bind(this));
			this.socket.on("pCn", this.sConnected.bind(this));	// Connected
			this.socket.on("pNw", this.playerCreate.bind(this));	// Players new
			this.socket.on("pUp", this.sPlayUpd.bind(this));	// Players update
			this.changeDirection();
		},
		
		//////////////////////////////////// KEYBOARD CONTROLS ////////////////////////////////////
		// Called every frame
		update: function (dt) {
			TWEEN.update();
			if(this.sStatus !== "connected"){return false;}
			if(this.receiver == null){return false;}
			this.vectorX = 0;
			this.vectorZ = 0;
			
			// WASD Controls
			if(app.keyboard.isPressed(pc.KEY_A)){
				this.vectorX --;
			}
			if(app.keyboard.isPressed(pc.KEY_D)){
				this.vectorX ++;
			}
			if(app.keyboard.isPressed(pc.KEY_W)){
				this.vectorZ --;
			}
			if(app.keyboard.isPressed(pc.KEY_S)){
				this.vectorZ ++;
			}
			if(this.vectorX !== 0 || this.vectorZ !== 0){
				this.buttonMove(dt);
			}else{
				this.noButtonMove();
			}
			/*else{
				this.autoTimer += dt;
				if(this.autoTimer > this.autoTimerMax){
					this.changeDirection();
				}
				// Auto controls
				if(this.autoX === 1){
					this.vectorX --;
				}
				if(this.autoX === 2){
					this.vectorX ++;
				}
				if(this.autoZ === 1){
					this.vectorZ --;
				}
				if(this.autoZ === 2){
					this.vectorZ ++;
				}
				if(this.vectorX !== 0 || this.vectorZ !== 0){
					this.buttonMove(dt);
				}else{
					this.noButtonMove(dt);
				}
			}*/

			// A Button
			if(app.keyboard.wasPressed(pc.KEY_O)){
				this.receiver.btnA();
				this.gadgetIDropped();
			}

			// B Button
			if(app.keyboard.wasPressed(pc.KEY_P)){
				this.receiver.btnB();
			}

			// Reset
			if(app.keyboard.wasPressed(pc.KEY_T)){
				this.receiver.reset();
			}
		},

		buttonMove: function (dt){
			// Calculate y Angle from x & z vectors
			this.yAngle = Math.atan2(this.vectorX, this.vectorZ) * (180 / Math.PI);
			this.receiver.moveToAngle(this.yAngle, dt);
		},

		noButtonMove: function (dt){
			this.receiver.decelerate(dt);
		},

		changeDirection: function(){
			do{
				this.autoX = getRandInt(0, 3);
				this.autoZ = getRandInt(0, 3);
			}while(this.autoX === 0 && this.autoZ === 0);

			this.autoTimerMax = getRandNo(0, 2);
			this.autoTimer = 0;
		},

		//////////////////////////////////// SOCKET EVENT EMITTERS ////////////////////////////////////
		// Player moved event
		receiverMoved: function(){
			this.socket.emit("pMv", {
				x: Math.round(this.receiverE.getPosition().x * 100) / 100, 
				y: Math.round(this.receiverE.getPosition().y * 100) / 100, 
				z: Math.round(this.receiverE.getPosition().z * 100) / 100,
				a: this.receiver.prevAngle,
				h: this.prelimID
			});
		},

		gadgetIPicked: function(){
			this.prelimID = this.id;
		},

		gadgetIDropped: function(){
			this.prelimID = -1;
			console.log("Attempting drop from " + this.holderID + " : " + this.id);
		},

		//////////////////////////////////// SOCKET EVENT LISTENERS ////////////////////////////////////
		// Connected socket
		sConnected: function(newUser, allUsers, gInfo){
			this.id = newUser.id;
			this.type = newUser.t;
			this.sStatus = "connected";
			
			// Create Ufo receiver
			if(this.type === 0){
				this.receiverE = app.root.findByName("Ufo").clone();
				app.systems.script.addComponent(this.receiverE,{
					scripts: [{url: "ufo.js"}]
				});
				this.receiver = this.receiverE.script.ufo;
			}	
			// Create Bot receiver
			else{
				this.receiverE = app.root.findByName("Bot").clone();
				app.systems.script.addComponent(this.receiverE,{
					scripts: [{url: "bot.js"}]
				});
				this.receiver = this.receiverE.script.bot;
			}
			
			// Add receiver to stage
			this.receiverE.setPosition(newUser.x, newUser.y, newUser.z);
			this.receiverE.enabled = true;
			this.receiver.connect(this);
			app.root.addChild(this.receiverE);

			// Populate existing users
			for(user in allUsers){
				if(this.id === allUsers[user].id){
					continue;
				}else{
					this.playerCreate(allUsers[user]);
				}
			}

			// Position existing users
			this.sPlayUpd(allUsers);

			// Connect camera
			this.camera.script.camera.connect(this.receiverE);

			// Create gadget
			console.log("Creating gadget");
			console.log(gInfo);
			this.gadget.enabled = true;
			if(gInfo.id === -1){
				this.gadget.setPosition(gInfo.x, gInfo.y, gInfo.z);
				app.systems.script.addComponent(this.gadget, {
					scripts: [{url: "gadget.js"}]
				});
			}else{
				app.systems.script.addComponent(this.gadget, {
					scripts: [{url: "gadget.js"}]
				});
				this.gadget.script.gadget.pickedUp(this.dummies[gInfo.id]);
			}
		},

		// Disconnected
		sDisc: function(){
			// Drop gadget
			if(this.receiver.itemCarry){
				this.gadget.script.gadget.dropped();
			}

			// Destroy receiver
			console.log("Disconnected");
			this.receiverE.destroy();
			this.receiver = null;
			this.receiverE = null;
			this.sStatus = "disconnected";
			this.id = null;

			// Delete all users
			for(user in this.dummies){
				if(this.id === user){
					continue;
				}else{
					this.playerDestroy(user);
				}
			}

			// Disconnect camera
			this.camera.script.camera.disconnect();
		},

		// Player update
		sPlayUpd: function(allUsers){
			if(!this.gadget.script.gadget){return false};
			// Positions
			for(user in allUsers){
				if(this.id === allUsers[user].id){continue;}

				if(allUsers[user].t === 0){// UFO
					this.dummies[user].script.dumufo.updateParams(allUsers[user]);
				}else{	// Bot
					this.dummies[user].script.dumbot.updateParams(allUsers[user]);
				}
			}

			this.tempUsr = allUsers[Object.keys(allUsers)[0]].h;
			// New pickup
			if(this.tempUsr !== -1 && this.holderID === -1){
				this.holderID = this.tempUsr;
				this.prelimID = this.tempUsr;
				if(this.holderID !== this.id){
					this.gadget.script.gadget.pickedUp(this.dummies[this.tempUsr]);
				}else{
					this.gadget.script.gadget.pickedUp(this.receiverE);
				}
			}

			// New dropped
			else if(this.tempUsr === -1 && this.holderID !== -1){
				this.gadget.script.gadget.dropped(allUsers[this.tempUsr]);
				this.holderID = -1;
				this.prelimID = -1;
			}

			// Check connects/disconnects
			if(Object.keys(allUsers).length !== Object.keys(this.dummies).length + 1){
				this.playerReconcile(allUsers);
			}
		},

		// Connection error
		sError: function(object){
			console.log("Connection error");
			this.sStatus = "disconnected";
			this.id = null;
		},

		//////////////////////////////////// PLAYER CREATION ////////////////////////////////////
		// New player connected
		playerCreate: function(user){
			if(user.t === 0){	// Ufo
				this.dummies[user.id] = app.root.findByName("Ufo").clone();
				app.systems.script.addComponent(this.dummies[user.id], {
					scripts: [{url: "dumufo.js"}]
				});
			}else{	// Bot
				this.dummies[user.id] = app.root.findByName("Bot").clone();
				this.dummies[user.id].rigidbody.type = pc.BODYTYPE_KINEMATIC;
				app.systems.script.addComponent(this.dummies[user.id], {
					scripts: [{url: "dumbot.js"}]
				});
			}
			this.dummies[user.id].setPosition(user.x, user.y, user.z);
			this.dummies[user.id].enabled = true;
			app.root.addChild(this.dummies[user.id]);
		},

		// Player disconnected
		playerDestroy: function(discID){
			console.log("Destroying " + discID);
			this.dummies[discID].destroy();
			delete this.dummies[discID];
		},

		// Match players to server data
		playerReconcile: function(allUsers){
			// Connect new 
			if(Object.keys(allUsers).length > Object.keys(this.dummies).length + 1){
				console.log("Connecting...");
				for(var i = 0; i < Object.keys(allUsers).length; i++){
					if(!this.dummies[Object.keys(allUsers)[i]] && Object.keys(allUsers)[i] !== this.id){
						// Connect!
					}
				}
			}
			// Disconnect
			else{
				console.log("Disconnecting...");
				for(var i = 0; i < Object.keys(this.dummies).length; i++){
					if(!allUsers[Object.keys(this.dummies)[i]] && Object.keys(this.dummies)[i] !== this.id){
						this.playerDestroy(Object.keys(this.dummies)[i]);
					}
				}
			}
		}
	};

	return Control;
});

var blabla = {
	1: {a: 1, b: 2},
	2: {c: 3, d: 4}
}