pc.script.create('ufo', function (app) {
	// Creates a new UFO instance
	var Ufo = function (entity) {
		// UFO parts
		this.entity		= entity;
		// Physics vars
		this.TIME_MULT	= 1;				// Time multiplier (for slo-mo)
		this.MAX_SPEED	= 0.08;				// Maximum speed
		this.ACCEL		= 0.001;			// Acceleration
		this.quatNow 	= new pc.Quat();	// Current angle
		this.quatTrg 	= new pc.Quat();	// Target angle
		this.rotAlpha	= 0;
		this.prevAngle	= 0;
		this.timeDelta	= 0;
		this.t 			= 0;
		this.velocity	= 0;
		this.moving		= false;
		this.victim		= null;
		// Components
		this.beamParticle = null;
	};

	Ufo.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function () {
			this.quatNow 	= this.entity.getRotation();
			this.beamParticle = this.entity.findByName("BeamUp").particlesystem;
			this.entity.collision.on("triggerenter", this.hoverOver.bind(this));
			this.entity.collision.on("triggerleave", this.hoverOut.bind(this));
		},
		
		// Called every frame, dt is time in seconds since last update
		update: function (dt) {
		},

		// Ufo will move toward angle
		moveToAngle: function (yAngle, dt) {
			this.moving = true;
			if(yAngle !== this.prevAngle){
				this.rotAlpha = 0;
				this.timeDelta = 0;
				this.prevAngle = yAngle;
			}

			// Turn toward angle
			if(this.rotAlpha < 0.5){
				this.quatTrg.setFromAxisAngle(pc.Vec3.UP, yAngle);

				this.timeDelta += (dt * this.TIME_MULT);
				this.rotAlpha = 1 - Math.pow((1 - this.timeDelta), 3);
				this.entity.setRotation(this.quatNow.slerp(this.quatNow, this.quatTrg, this.rotAlpha));
			}

			this.velocity += this.ACCEL;
			this.velocity = Math.min(this.velocity, this.MAX_SPEED);
			this.entity.translateLocal(0, 0, this.velocity);
			// this.entity.rigidbody.syncEntityToBody();
		},

		decelerate: function (dt) {
			this.moving = false;
			if(this.velocity === 0) return false;

			this.velocity -= this.ACCEL * 2;
			this.velocity = Math.max(this.velocity, 0);

			this.entity.translateLocal(0, 0, this.velocity);
			// this.entity.rigidbody.syncEntityToBody();
		},

		// Animates rotation
		updateRotation: function(dt){
			// When animation is over
			if(this.t >= 1){
				this.rotationComplete();
			}
		},
		
		// At the end of a rotation
		rotationComplete: function(){
			this.quatNow 	= this.entity.getRotation();
			this.frameCount = 0;
			this.t = 0;
		},

		// Hovers over entity
		hoverOver: function(result){
			this.victim = result.script.bot;
			this.victim.enterDanger();
		},

		// Hovers off entity
		hoverOut: function(result){
			this.victim.exitDanger();
			this.victim = null;
		},

		btnA: function(){
			if(this.victim !== null){
				this.victim.abduct();
			}
			this.beamParticle.play();
			this.beamParticle.reset();
		},

		btnB: function(){

		},

		reset: function(){
			this.prevAngle = 0;
			this.entity.setPosition(0, 1.5, 0);
			// this.entity.rigidbody.teleport(0, 3, 0, 0, 0, 0);
		},

		liftArms: function(){

		},

		dropBombF: function(){

		},

		dropBombB: function(){

		},

		createBomb: function(direction){

		}
	};

	return Ufo;
});


