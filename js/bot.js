// Roboblasters notes:
// Hands-free mode: No hands allowed
// No-wheels mode: Cannot move 

pc.script.attribute("torque", "number", 40);

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
	};

	Bot.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function () {
			this.faceMaterial = this.entity.findByName("BotModel").model.model.meshInstances[1].material;
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

		abduct: function(){
			this.reset();
		},

		btnA: function(){

		},

		btnB: function(){

		},

		reset: function(){
			this.entity.rigidbody.teleport(0, 1.65, 0, 0, 0, 0);
		}
	};

	return Bot;
});


