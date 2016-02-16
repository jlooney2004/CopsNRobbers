pc.script.create('bot', function (app) {
	// Creates a new Bot instance
	var Bot = function (entity) {
		// Robot parts
		this.entity		= entity;

		// Physics vars
		this.TIME_MULT	= 1;				// Time multiplier (for slo-mo)
		this.MAX_SPEED	= 0.07;				// Maximum speed
		this.ACCEL		= 0.001;			// Acceleration
		this.velocity	= 0;
		this.faceMaterial	= null;
		this.itemCarry	= null;				// Will contain gadget
	};

	Bot.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function () {
			this.faceMaterial = this.entity.findByName("BotModel").model.model.meshInstances[1].material;
			this.entity.collision.on("triggerenter", this.hoverOver.bind(this));
			this.entity.collision.on("triggerleave", this.hoverOut.bind(this));
		},
		
		// Called every frame, dt is time in seconds since last update
		update: function (dt) {
		},

		// Bot will move toward angle
		moveToAngle: function (yAngle, dt) {
			this.entity.setEulerAngles(0, yAngle, 0);

			this.velocity += this.ACCEL * 2;
			this.velocity = Math.min(this.velocity, this.MAX_SPEED);
			this.entity.translateLocal(0, 0, this.velocity);
			this.entity.rigidbody.syncEntityToBody();
		},

		decelerate: function (dt) {
			if(this.velocity === 0) return false;

			this.velocity -= this.ACCEL * 2;
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

		////////////////////////////// EXTERNAL EVENTS ////////////////////////////// 
		// When picking up item
		pickup: function(item){
			if(item.getName() === "Gadget"){
				this.itemCarry = item.script.gadget;
				this.itemCarry.pickup(this.entity);
			}
		},

		// When being abducted
		abduct: function(){
			// Drop item being carried
			if(this.itemCarry !== null){
				this.itemCarry.drop();
				this.itemCarry = null;
			}
			this.reset();
		},

		// Enter trigger volume
		hoverOver: function(result){
			console.log("HoverOver: " + result.getName());
			/*if(result.getName() === "UFO"){
				this.enterDanger();
			}else if(result.getName() === "Gadget"){
				this.itemCarry = result.script.gadget;
				this.itemCarry.pickup();
			}*/
		},

		// Exit trigger volume
		hoverOut: function(result){
			console.log("HoverOut: " + result.getName());
			/*if(result.getName() === "UFO"){
				this.exitDanger();
			}*/
		}
	};

	return Bot;
});


