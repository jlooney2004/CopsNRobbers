pc.script.create('bot', function (app) {
	// Creates a new Bot instance
	var Bot = function (entity) {
		// Robot parts
		this.entity		= entity;
		this.controller = null;

		// Physics vars
		this.TIME_MULT	= 1;				// Time multiplier (for slo-mo)
		this.velocity	= 0;				// Current velocity
		this.ACCEL		= 0.002;			// Acceleration
		this.MAX_VEL	= 0.07;				// Maximum velocity
		this.faceMaterial = null;
		this.itemCarry	= null;				// Will contain gadget

		// Status variables
		this.oldPos = null;
		this.newPos = null;
		this.posTimer = 0;

		// Tween variables
		this.quatNow 	= new pc.Quat();	// Current angle
		this.quatTrg 	= new pc.Quat();	// Target angle
		this.prevAngle	= 0;
		this.animVars	= {rotateI: 0};
		this.twRotate	= new TWEEN.Tween(this.animVars).easing(Ez.Sin.O);
	};

	Bot.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function(){
			this.quatNow 	= this.entity.getRotation();
			this.faceMaterial = this.entity.findByName("BotModel").model.model.meshInstances[1].material;
			this.entity.collision.on("triggerenter", this.onTriggerEnter.bind(this));
			this.entity.collision.on("triggerleave", this.onTriggerLeave.bind(this));
			
			this.newPos = this.entity.getPosition();
			this.oldPos = new pc.Vec3();
		},
		
		// Called every frame, dt is time in seconds since last update
		update: function(dt){
			this.newPos = this.entity.getPosition();
			this.posTimer += dt;
			if(this.posTimer >= 0.02 && !this.newPos.equals(this.oldPos)){
				this.oldPos = this.newPos.clone();
				this.controller.receiverMoved();
				this.posTimer = 0;
			}
		},

		///////////////////////////////////// CONTROL LISTENERS /////////////////////////////////////
		// Connect to controller
		connect: function(controller){
			this.controller = controller;
		},

		// Bot will move toward angle
		moveToAngle: function(yAngle, dt){
			if(yAngle !== this.prevAngle){
				this.animVars.rotateI = 0;
				this.prevAngle = yAngle;
				this.twRotate.to({rotateI: 1}, 1000).start();
				this.quatTrg.setFromAxisAngle(pc.Vec3.UP, yAngle);
			}

			this.entity.setRotation(this.quatNow.slerp(this.quatNow, this.quatTrg, this.animVars.rotateI));

			this.velocity += this.ACCEL;
			this.velocity = Math.min(this.velocity, this.MAX_VEL);
			this.entity.translateLocal(0, 0, this.velocity);
			this.entity.rigidbody.syncEntityToBody();
		},

		// Decelerates when no button is pressed
		decelerate: function(dt){
			if(this.velocity === 0) return false;

			this.velocity -= this.ACCEL;
			this.velocity = Math.max(this.velocity, 0);

			this.entity.translateLocal(0, 0, this.velocity);
			this.entity.rigidbody.syncEntityToBody();
		},

		enterDanger: function(){
			this.faceMaterial.emissive = new pc.Vec3(1, 0, 0);
			this.faceMaterial.update();
		},

		exitDanger: function(){
			this.faceMaterial.emissive = new pc.Vec3(0, 0.56, 1);
			this.faceMaterial.update();
		},

		btnA: function(){

		},

		btnB: function(){

		},

		// Teleport to a location
		reset: function(){
			if(this.entity.getPosition().x > 0){
				this.entity.rigidbody.teleport(-27, 1.8, 0, 0, 0, 0);
			}else{
				this.entity.rigidbody.teleport(10, 0.3, 0, 0, 0, 0);
			}
		},

		///////////////////////////////////// EVENT LISTENERS /////////////////////////////////////
		// When being abducted
		abduct: function(){
			// Drop item being carried
			if(this.itemCarry !== null){
				this.itemCarry.dropped();
				this.itemCarry = null;
			}
			this.reset();
		},

		onTriggerEnter: function(result){
			switch(result.getName()){
				case "Ufo":
					this.enterDanger();
				break;
				case "Gadget":
					this.itemCarry = result.script.gadget;
					this.controller.gIPicked(result.getPosition());
				break;
			}
		},

		onTriggerLeave: function(result){
			switch(result.getName()){
				case "Ufo":
					this.exitDanger();
				break;
				case "Gadget":
					this.itemCarry = null;
				break;
			}
		}
	};

	return Bot;
});


